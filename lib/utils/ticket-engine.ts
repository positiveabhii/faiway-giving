import type { GolfScore, MatchType } from "@/types/database";
import type { DrawSimulationResult } from "@/types/domain";

export interface TicketEntry {
  user_id: string;
  ticket: number[];
}

type TicketScore = Pick<GolfScore, "user_id" | "draw_id" | "score_value" | "status">;

export function buildUserTicketForDraw(scores: TicketScore[], userId: string, drawId: string): number[] {
  return scores
    .filter((score) => score.user_id === userId && score.draw_id === drawId && score.status === "verified")
    .map((score) => score.score_value)
    .sort((a, b) => a - b)
    .slice(0, 5);
}

export const buildUserTicketFromScores = buildUserTicketForDraw;

export function buildTicketsForDraw(scores: TicketScore[], drawId: string): TicketEntry[] {
  const userIds = Array.from(new Set(
    scores
      .filter((score) => score.draw_id === drawId && score.status === "verified")
      .map((score) => score.user_id)
  ));

  return userIds
    .map((user_id) => ({ user_id, ticket: buildUserTicketForDraw(scores, user_id, drawId) }))
    .filter((entry) => entry.ticket.length === 5);
}

export function evaluateTickets(luckyNumbers: number[], entries: TicketEntry[]): DrawSimulationResult {
  const normalizedLuckyNumbers = [...luckyNumbers].sort((a, b) => a - b);
  const winners: DrawSimulationResult["winners"] = [];

  for (const entry of entries) {
    const match_count = entry.ticket.filter((score) => normalizedLuckyNumbers.includes(score)).length;
    const match_type = matchTypeForCount(match_count);

    if (match_type) {
      winners.push({ ...entry, match_count, match_type });
    }
  }

  return {
    luckyNumbers: normalizedLuckyNumbers,
    entries,
    winners,
  };
}

function matchTypeForCount(count: number): MatchType | null {
  if (count === 5) return "5 Matches";
  if (count === 4) return "4 Matches";
  if (count === 3) return "3 Matches";
  return null;
}
