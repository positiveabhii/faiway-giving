import { jsonError, jsonOk, parseJson, requireAuth, requireActive } from "@/lib/server/api";
import { scoreCreateSchema, scoreDeleteSchema } from "@/lib/validations/score";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireActive();
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, scoreCreateSchema);
  if (body instanceof Response) return body;

  const playedDate = new Date(`${body.played_date}T00:00:00`);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  if (playedDate > today) return jsonError("Future score dates are not allowed.", 422);
  if (playedDate < sixMonthsAgo) return jsonError("Scores older than 6 months are not allowed.", 422);

  const { data: existing, error: existingError } = await auth.supabase
    .from("golf_scores")
    .select("id")
    .eq("user_id", auth.authUser.id)
    .eq("played_date", body.played_date)
    .maybeSingle();

  if (existingError) return jsonError("Unable to check your existing scores.", 500);
  if (existing) return jsonError("A score already exists for this date.", 409);

  const { data: currentScores, error: scoresError } = await auth.supabase
    .from("golf_scores")
    .select("id, played_date")
    .eq("user_id", auth.authUser.id)
    .order("played_date", { ascending: false });

  if (scoresError) return jsonError("Unable to load your current score ticket.", 500);

  if ((currentScores ?? []).length >= 5) {
    const oldest = currentScores?.[currentScores.length - 1];
    if (oldest) {
      const { error: deleteError } = await auth.supabase
        .from("golf_scores")
        .delete()
        .eq("id", oldest.id)
        .eq("user_id", auth.authUser.id);
      if (deleteError) return jsonError("Unable to rotate your oldest score.", 500);
    }
  }

  const { data, error } = await auth.supabase
    .from("golf_scores")
    .insert({
      user_id: auth.authUser.id,
      score_value: body.score_value,
      played_date: body.played_date,
      status: "verified",
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, scoreDeleteSchema);
  if (body instanceof Response) return body;

  const { error } = await auth.supabase
    .from("golf_scores")
    .delete()
    .eq("id", body.score_id)
    .eq("user_id", auth.authUser.id);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ id: body.score_id });
}
