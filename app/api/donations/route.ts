import { jsonError, jsonOk, parseJson, requireAuth, requireActive } from "@/lib/server/api";
import { donationCreateSchema } from "@/lib/validations/donation";
import { getOrCreateActiveDraw } from "@/lib/server/draw-cycle";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireActive();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, donationCreateSchema);
  if (body instanceof Response) return body;

  const { data: charity, error: charityError } = await auth.supabase
    .from("charities")
    .select("id")
    .eq("id", body.charity_id)
    .maybeSingle();

  if (charityError) return jsonError("Unable to validate that charity.", 500);
  if (!charity) return jsonError("Choose an active charity before donating.", 422);

  const { data: activeDraw, error: drawError } = await getOrCreateActiveDraw(auth.supabase);
  if (drawError || !activeDraw) return jsonError("Unable to identify current competition cycle for donation.", 500);

  const { data, error } = await writer
    .from("charity_donations")
    .insert({
      user_id: auth.authUser.id,
      draw_id: activeDraw.id,
      charity_id: body.charity_id,
      amount: body.amount,
      donation_type: 'manual_direct',
      source_winner_id: null
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, { status: 201 });
}
