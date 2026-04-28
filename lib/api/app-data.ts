import type { ApiResponse, AppDataResponse } from "@/types/api";

export async function getAppData(): Promise<AppDataResponse> {
  const response = await fetch("/api/app-data", { method: "GET" });
  const payload = await response.json() as ApiResponse<AppDataResponse>;

  if (!payload.ok) {
    throw new Error(payload.error);
  }

  return payload.data;
}
