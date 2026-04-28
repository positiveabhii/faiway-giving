import { apiJson } from "@/lib/api/client";
import type { DrawExecuteRequest, DrawExecuteResponse } from "@/types/api";
import type { DrawSimulationResult } from "@/types/domain";

export function executeDraw(data: DrawExecuteRequest) {
  return apiJson<DrawExecuteResponse, DrawExecuteRequest>("/api/draw/execute", "POST", data);
}

export function simulateDraw(data: DrawExecuteRequest) {
  return apiJson<DrawSimulationResult, DrawExecuteRequest>("/api/draw/simulate", "POST", data);
}
