import { jsonError, jsonOk, parseJson, requireAuth } from "@/lib/server/api";
import { subscriptionManageSchema } from "@/lib/validations/subscription";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, subscriptionManageSchema);
  if (body instanceof Response) return body;

  const targetUserId = body.user_id ?? auth.authUser.id;
  if (targetUserId !== auth.authUser.id && auth.profile.role !== "admin") {
    return jsonError("Admin access is required to manage another user's subscription.", 403);
  }

  const updates: { plan?: "monthly" | "yearly"; status?: "active" | "canceled" | "past_due"; next_renewal_date?: string } = {};

  if (body.plan) {
    updates.plan = body.plan;
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + (body.plan === "yearly" ? 12 : 1));
    updates.next_renewal_date = renewalDate.toISOString();
  }

  if (body.status) {
    updates.status = body.status;
  }

  const { data, error } = await auth.supabase
    .from("subscriptions")
    .update(updates)
    .eq("user_id", targetUserId)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}
