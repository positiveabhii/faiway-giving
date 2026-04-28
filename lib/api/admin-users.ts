import { apiJson } from "@/lib/api/client";
import type { AdminUserUpdateRequest } from "@/types/api";
import type { Profile } from "@/types/database";

export function updateAdminUser(data: AdminUserUpdateRequest) {
  return apiJson<Profile, AdminUserUpdateRequest>("/api/admin/users", "PATCH", data);
}
