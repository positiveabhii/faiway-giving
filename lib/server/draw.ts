import type { DrawMode, DrawSimulationResult } from "@/types/domain";
import type { MatchType } from "@/types/database";

interface UserDrawEntry {
  user_id: string;
  scores: number[];
}

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

export function evaluateDraw(luckyNumbers: number[], entries: UserDrawEntry[]): DrawSimulationResult {
  const winners: DrawSimulationResult["winners"] = [];

  for (const entry of entries) {
    const match_count = entry.scores.filter((score) => luckyNumbers.includes(score)).length;
    const match_type = matchTypeForCount(match_count);

    if (match_type) {
      winners.push({ user_id: entry.user_id, match_count, match_type });
    }
  }

  return { luckyNumbers, winners };
}

export function buildEntries(scores: Array<{ user_id: string; score_value: number; played_date: string }>): UserDrawEntry[] {
  const grouped = new Map<string, number[]>();

  for (const score of scores) {
    if (!grouped.has(score.user_id)) {
      grouped.set(score.user_id, []);
    }
    const list = grouped.get(score.user_id);
    if (list && list.length < 5) {
      list.push(score.score_value);
    }
  }

  return Array.from(grouped.entries())
    .filter(([, userScores]) => userScores.length >= 5)
    .map(([user_id, userScores]) => ({ user_id, scores: userScores }));
}

function matchTypeForCount(count: number): MatchType | null {
  if (count === 5) return "5 Matches";
  if (count === 4) return "4 Matches";
  if (count === 3) return "3 Matches";
  return null;
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
