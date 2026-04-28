import { apiJson } from "@/lib/api/client";
import type { SubscriptionManageRequest } from "@/types/api";
import type { Subscription } from "@/types/database";

export function manageSubscription(data: SubscriptionManageRequest) {
  return apiJson<Subscription, SubscriptionManageRequest>("/api/subscriptions/manage", "PATCH", data);
}
