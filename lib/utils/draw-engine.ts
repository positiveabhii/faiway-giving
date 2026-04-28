import { evaluateTickets, type TicketEntry } from "@/lib/utils/ticket-engine";

export type UserDrawEntry = TicketEntry;

export interface SimulationResult {
  luckyNumbers: number[];
  winners: {
    user_id: string;
    match_count: number;
    match_type: '5 Matches' | '4 Matches' | '3 Matches';
    ticket: number[];
  }[];
  entries: TicketEntry[];
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
  return evaluateTickets(luckyNumbers, entries).winners;
};

export const runDrawSimulation = (entries: UserDrawEntry[], mode: 'random' | 'algorithmic' = 'random'): SimulationResult => {
  const luckyNumbers = generateLuckyNumbers(mode);
  return evaluateTickets(luckyNumbers, entries);
};
