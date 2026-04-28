import { apiJson } from "@/lib/api/client";
import type { DrawExecuteRequest, DrawExecuteResponse } from "@/types/api";

export function executeDraw(data: DrawExecuteRequest) {
  return apiJson<DrawExecuteResponse, DrawExecuteRequest>("/api/draw/execute", "POST", data);
}
