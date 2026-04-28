import { jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/server/api";
import { buildEntries, deterministicLuckyNumbers, evaluateDraw } from "@/lib/server/draw";
import { calculatePayouts } from "@/lib/utils/prize-engine";
import { drawExecuteSchema } from "@/lib/validations/draw";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, drawExecuteSchema);
  if (body instanceof Response) return body;

  const { data: draw, error: drawError } = await auth.supabase
    .from("draw_results")
    .select("*")
    .eq("id", body.draw_id)
    .maybeSingle();

  if (drawError) return jsonError("Unable to load the draw.", 500);
  if (!draw) return jsonError("Draw not found.", 404);
  if (draw.status !== "upcoming") return jsonError("Only upcoming draws can be executed.", 409);

  const { data: existingWinners, error: existingWinnersError } = await auth.supabase
    .from("draw_winners")
    .select("id")
    .eq("draw_id", body.draw_id)
    .limit(1);

  if (existingWinnersError) return jsonError("Unable to check existing winners.", 500);
  if ((existingWinners ?? []).length > 0) return jsonError("This draw already has published winners.", 409);

  const { data: pool, error: poolError } = await auth.supabase
    .from("prize_pools")
    .select("*")
    .eq("draw_id", body.draw_id)
    .maybeSingle();

  if (poolError) return jsonError("Unable to load the prize pool.", 500);
  if (!pool) return jsonError("A prize pool is required before executing a draw.", 422);

  const { data: scores, error: scoresError } = await auth.supabase
    .from("golf_scores")
    .select("user_id, score_value, played_date")
    .eq("status", "verified")
    .order("user_id", { ascending: true })
    .order("played_date", { ascending: false });

  if (scoresError) return jsonError("Unable to load verified score entries.", 500);

  const entries = buildEntries(scores ?? []);
  if (entries.length === 0) return jsonError("No eligible players have five verified scores.", 422);

  const luckyNumbers = deterministicLuckyNumbers(`${draw.id}:${draw.month_name}:${draw.countdown_end ?? ""}`, body.mode);
  const result = evaluateDraw(luckyNumbers, entries);
  const { payouts } = calculatePayouts(pool, result.winners);

  const { data: updatedDraw, error: updateError } = await auth.supabase
    .from("draw_results")
    .update({
      status: "completed",
      lucky_numbers: luckyNumbers,
      total_participants: entries.length,
    })
    .eq("id", body.draw_id)
    .eq("status", "upcoming")
    .select()
    .single();

  if (updateError) return jsonError(`Unable to publish draw result: ${updateError.message}`, 500);

  const rows = payouts.map((payout) => ({
    draw_id: body.draw_id,
    user_id: payout.user_id,
    match_type: payout.match_type,
    prize_amount: payout.prize_amount,
  }));

  if (rows.length === 0) {
    return jsonOk({ draw: updatedDraw, winners: [], luckyNumbers });
  }

  const { data: winners, error: winnersError } = await auth.supabase
    .from("draw_winners")
    .insert(rows)
    .select();

  if (winnersError) return jsonError(`Draw completed but winner publication failed: ${winnersError.message}`, 500);
  return jsonOk({ draw: updatedDraw, winners: winners ?? [], luckyNumbers });
}
