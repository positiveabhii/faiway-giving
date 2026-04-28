import { jsonError, jsonOk, parseJson, requireAuth, requireActive } from "@/lib/server/api";
import { scoreCreateSchema, scoreDeleteSchema } from "@/lib/validations/score";
import { getOrCreateActiveDraw } from "@/lib/server/draw-cycle";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireActive();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

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

  const { data: activeDraw, error: drawError } = await getOrCreateActiveDraw(auth.supabase);
  if (drawError || !activeDraw) return jsonError("Unable to identify the active competition cycle.", 500);

  // Check existence using auth client (read is fine)
  const { data: existing, error: existingError } = await auth.supabase
    .from("golf_scores")
    .select("id")
    .eq("user_id", auth.authUser.id)
    .eq("draw_id", activeDraw.id)
    .eq("played_date", body.played_date)
    .maybeSingle();

  if (existingError) return jsonError("Unable to check your existing scores.", 500);
  if (existing) return jsonError("A score already exists for this date.", 409);

  // Mutation using writer client
  const { data, error } = await writer
    .from("golf_scores")
    .insert({
      user_id: auth.authUser.id,
      draw_id: activeDraw.id,
      score_value: body.score_value,
      played_date: body.played_date,
      status: "verified",
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);

  const { count: userScoreCount } = await auth.supabase
    .from("golf_scores")
    .select("id", { count: 'exact', head: true })
    .eq("user_id", auth.authUser.id)
    .eq("draw_id", activeDraw.id);

  if (userScoreCount === 1) {
    await writer
      .from("draw_results")
      .update({ total_participants: (activeDraw.total_participants || 0) + 1 })
      .eq("id", activeDraw.id);
  }

  return jsonOk(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, scoreDeleteSchema);
  if (body instanceof Response) return body;

  const { error } = await writer
    .from("golf_scores")
    .delete()
    .eq("id", body.score_id)
    .eq("user_id", auth.authUser.id);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ id: body.score_id });
}
