import { jsonError, jsonOk, parseJson, requireAuth, requireActive } from "@/lib/server/api";
import { donationCreateSchema } from "@/lib/validations/donation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireActive();
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, donationCreateSchema);
  if (body instanceof Response) return body;

  const { data: charity, error: charityError } = await auth.supabase
    .from("charities")
    .select("id")
    .eq("id", body.charity_id)
    .maybeSingle();

  if (charityError) return jsonError("Unable to validate that charity.", 500);
  if (!charity) return jsonError("Choose an active charity before donating.", 422);

  const { data: winnings, error: winningsError } = await auth.supabase
    .from("draw_winners")
    .select("prize_amount, payout_status")
    .eq("user_id", auth.authUser.id);

  if (winningsError) return jsonError("Unable to verify your winnings balance.", 500);

  const available = (winnings ?? [])
    .filter((winner) => winner.payout_status !== "paid")
    .reduce((sum, winner) => sum + Number(winner.prize_amount), 0);

  if (available <= 0) return jsonError("You need an available winnings balance before donating winnings.", 422);
  if (body.amount > available) return jsonError(`Donation cannot exceed your available winnings balance of $${available.toFixed(2)}.`, 422);

  const { data, error } = await auth.supabase
    .from("charity_donations")
    .insert({
      user_id: auth.authUser.id,
      charity_id: body.charity_id,
      amount: body.amount,
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, { status: 201 });
}
