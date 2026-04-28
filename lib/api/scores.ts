import { apiJson } from "@/lib/api/client";
import type { GolfScore } from "@/types/database";
import type { ScoreCreateRequest, ScoreDeleteRequest } from "@/types/api";

export function createScore(data: ScoreCreateRequest) {
  return apiJson<GolfScore, ScoreCreateRequest>("/api/scores", "POST", data);
}

export function deleteScore(data: ScoreDeleteRequest) {
  return apiJson<{ id: string }, ScoreDeleteRequest>("/api/scores", "DELETE", data);
}
