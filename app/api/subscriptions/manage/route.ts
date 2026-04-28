import { jsonError, jsonOk, parseJson, requireAuth } from "@/lib/server/api";
import { subscriptionManageSchema } from "@/lib/validations/subscription";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, subscriptionManageSchema);
  if (body instanceof Response) return body;

  const targetUserId = body.user_id ?? auth.authUser.id;
  if (targetUserId !== auth.authUser.id && auth.profile.role !== "admin") {
    return jsonError("Admin access is required to manage another user's subscription.", 403);
  }

  const updates: { plan?: "monthly" | "yearly"; status?: "active" | "canceled" | "past_due" | "pending_payment"; next_renewal_date?: string | null } = {};

  if (body.plan) {
    updates.plan = body.plan;
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + (body.plan === "yearly" ? 12 : 1));
    updates.next_renewal_date = renewalDate.toISOString();
  }

  if (body.status) {
    updates.status = body.status as any;
  }

  const { data, error } = await writer
    .from("subscriptions")
    .update(updates)
    .eq("user_id", targetUserId)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}
