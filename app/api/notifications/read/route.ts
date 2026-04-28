import { jsonError, jsonOk, parseJson, requireAuth } from "@/lib/server/api";
import { notificationReadSchema } from "@/lib/validations/notification";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, notificationReadSchema);
  if (body instanceof Response) return body;

  if (body.all) {
    const { error, count } = await writer
      .from("notifications")
      .update({ is_read: true }, { count: "exact" })
      .eq("user_id", auth.authUser.id)
      .eq("is_read", false);

    if (error) return jsonError(error.message, 500);
    return jsonOk({ count: count ?? 0 });
  }

  if (!body.notification_id) {
    return jsonError("Notification id is required.", 422);
  }

  const { error, count } = await writer
    .from("notifications")
    .update({ is_read: true }, { count: "exact" })
    .eq("id", body.notification_id)
    .eq("user_id", auth.authUser.id);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ count: count ?? 0 });
}
