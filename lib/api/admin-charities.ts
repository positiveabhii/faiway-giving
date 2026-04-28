import { apiJson } from "@/lib/api/client";
import type { CharityDeleteRequest, CharityWriteRequest } from "@/types/api";
import type { Charity } from "@/types/database";

export function createAdminCharity(data: CharityWriteRequest) {
  return apiJson<Charity, CharityWriteRequest>("/api/admin/charities", "POST", data);
}

export function updateAdminCharity(data: CharityWriteRequest & { id: string }) {
  return apiJson<Charity, CharityWriteRequest>("/api/admin/charities", "PATCH", data);
}

export function deleteAdminCharity(data: CharityDeleteRequest) {
  return apiJson<{ id: string }, CharityDeleteRequest>("/api/admin/charities", "DELETE", data);
}
