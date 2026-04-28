import type { MatchType } from "@/types/database";

export type DrawMode = "random" | "algorithmic";

export interface DrawSimulationWinner {
  user_id: string;
  match_count: number;
  match_type: MatchType;
}

export interface DrawSimulationResult {
  luckyNumbers: number[];
  winners: DrawSimulationWinner[];
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}
