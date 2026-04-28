import { apiJson } from "@/lib/api/client";
import type { NotificationReadRequest } from "@/types/api";

export function markNotificationRead(data: NotificationReadRequest) {
  return apiJson<{ count: number }, NotificationReadRequest>("/api/notifications/read", "PATCH", data);
}
