import type { DrawMode, DrawSimulationResult } from "@/types/domain";
import { buildTicketsForDraw, evaluateTickets, type TicketEntry } from "@/lib/utils/ticket-engine";

export function deterministicLuckyNumbers(seed: string, mode: DrawMode): number[] {
  const values: number[] = [];
  let cursor = 0;

  while (values.length < 5) {
    const hash = hashString(`${seed}:${mode}:${cursor}`);
    const candidate = (hash % 45) + 1;
    if (!values.includes(candidate)) {
      values.push(candidate);
    }
    cursor += 1;
  }

  return values.sort((a, b) => a - b);
}

export function evaluateDraw(luckyNumbers: number[], entries: TicketEntry[]): DrawSimulationResult {
  return evaluateTickets(luckyNumbers, entries);
}

export function buildEntries(scores: Array<{ user_id: string; draw_id: string; score_value: number; status: "entered" | "verified" | "rejected" }>, drawId: string): TicketEntry[] {
  return buildTicketsForDraw(scores, drawId);
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
