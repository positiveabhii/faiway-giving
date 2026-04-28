import { jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/server/api";
import { deterministicLuckyNumbers } from "@/lib/server/draw";
import { calculatePayouts } from "@/lib/utils/prize-engine";
import { drawExecuteSchema } from "@/lib/validations/draw";
import { getOrCreateActiveDraw } from "@/lib/server/draw-cycle";
import { buildDrawTickets } from "@/lib/server/tickets";
import { evaluateTickets } from "@/lib/utils/ticket-engine";

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

  const { data: pool, error: poolError } = await auth.supabase
    .from("prize_pools")
    .select("*")
    .eq("draw_id", body.draw_id)
    .maybeSingle();

  if (poolError || !pool) return jsonError("A prize pool is required before executing a draw.", 422);

  const { data: existingWinners, error: existingWinnersError } = await auth.supabase
    .from("draw_winners")
    .select("id")
    .eq("draw_id", body.draw_id)
    .limit(1);

  if (existingWinnersError) return jsonError("Unable to check existing winners.", 500);
  if ((existingWinners ?? []).length > 0) return jsonError("This draw already has published winners.", 409);

  const { data: entries, error: ticketsError } = await buildDrawTickets(auth.supabase, body.draw_id);
  if (ticketsError) return jsonError("Unable to build tickets for this draw.", 500);
  if (!entries || entries.length === 0) return jsonError("No eligible players have five verified scores in this cycle.", 422);

  const luckyNumbers = body.lucky_numbers ?? deterministicLuckyNumbers(`${draw.id}:${draw.month_name}:${draw.countdown_end ?? ""}`, body.mode);
  const result = evaluateTickets(luckyNumbers, entries);
  const { payouts } = calculatePayouts(pool, result.winners);

  // 1. Mark current draw as completed
  const { data: updatedDraw, error: updateError } = await auth.supabase
    .from("draw_results")
    .update({
      status: "completed",
      lucky_numbers: luckyNumbers,
      total_participants: entries.length,
    })
    .eq("id", body.draw_id)
    .select()
    .single();

  if (updateError) return jsonError(`Unable to complete draw: ${updateError.message}`, 500);

  // 2. Process winners, verifications, notifications, and donations
  if (payouts.length > 0) {
    for (const payout of payouts) {
      // Create winner record
      const { data: winner, error: winnerError } = await auth.supabase
        .from("draw_winners")
        .insert({
          draw_id: body.draw_id,
          user_id: payout.user_id,
          match_type: payout.match_type,
          prize_amount: payout.prize_amount,
          payout_status: "pending",
        })
        .select()
        .single();

      if (winnerError) return jsonError(`Unable to create winner record: ${winnerError.message}`, 500);

      // Create verification placeholder
      await auth.supabase
        .from("winner_verifications")
        .insert({
          winner_id: winner.id,
          user_id: payout.user_id,
          status: "pending",
        });

      // Create notification
      await auth.supabase
        .from("notifications")
        .insert({
          user_id: payout.user_id,
          title: "Congratulations! You've won!",
          message: `You matched ${payout.match_type.split(' ')[0]} numbers in the ${draw.month_name} draw! Check your winnings page.`,
        });

      // Handle charity donation if user has a selection
      const { data: selection } = await auth.supabase
        .from("user_charity_selections")
        .select("charity_id, contribution_percentage")
        .eq("user_id", payout.user_id)
        .maybeSingle();

      if (selection) {
        const donationAmount = (payout.prize_amount * selection.contribution_percentage) / 100;
        await auth.supabase
          .from("charity_donations")
          .insert({
            draw_id: body.draw_id,
            user_id: payout.user_id,
            charity_id: selection.charity_id,
            amount: donationAmount,
            donation_type: 'automatic_winnings',
            source_winner_id: winner.id
          });
      }
    }
  }

  // Create next month's draw automatically (this will also handle rollover logic in the helper)
  const { error: nextDrawError } = await getOrCreateActiveDraw(auth.supabase);
  if (nextDrawError) {
    console.error("Failed to auto-create next draw:", nextDrawError);
  }

  const { data: winners } = await auth.supabase
    .from("draw_winners")
    .select("*")
    .eq("draw_id", body.draw_id);

  return jsonOk({
    draw: updatedDraw,
    winners: winners ?? [],
    luckyNumbers,
  });
}
