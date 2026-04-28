import { DrawResult, GolfScore } from "@/types";

export interface UserDrawEntry {
  user_id: string;
  scores: number[];
}

export interface SimulationResult {
  luckyNumbers: number[];
  winners: {
    user_id: string;
    match_count: number;
    match_type: '5 Matches' | '4 Matches' | '3 Matches';
  }[];
}

export const generateLuckyNumbers = (mode: 'random' | 'algorithmic'): number[] => {
  const result: number[] = [];
  while (result.length < 5) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (result.indexOf(r) === -1) result.push(r);
  }
  return result.sort((a, b) => a - b);
};

export const evaluateWinners = (
  luckyNumbers: number[],
  entries: UserDrawEntry[]
): SimulationResult['winners'] => {
  const winners: SimulationResult['winners'] = [];
  
  entries.forEach(entry => {
    // A user's numbers are their latest 5 scores
    const matchCount = entry.scores.filter(s => luckyNumbers.includes(s)).length;
    
    if (matchCount === 5) {
      winners.push({ user_id: entry.user_id, match_count: 5, match_type: '5 Matches' });
    } else if (matchCount === 4) {
      winners.push({ user_id: entry.user_id, match_count: 4, match_type: '4 Matches' });
    } else if (matchCount === 3) {
      winners.push({ user_id: entry.user_id, match_count: 3, match_type: '3 Matches' });
    }
  });
  
  return winners;
};

export const runDrawSimulation = (entries: UserDrawEntry[], mode: 'random' | 'algorithmic' = 'random'): SimulationResult => {
  const luckyNumbers = generateLuckyNumbers(mode);
  const winners = evaluateWinners(luckyNumbers, entries);
  return { luckyNumbers, winners };
};
