import { jsonError, jsonOk, parseJson, requireAuth } from "@/lib/server/api";
import { adminUserUpdateSchema } from "@/lib/validations/admin";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, adminUserUpdateSchema);
  if (body instanceof Response) return body;

  const isSelfNameUpdate = body.user_id === auth.authUser.id && !body.status && !body.role;
  const isAdminUpdate = auth.profile.role === "admin";

  if (!isSelfNameUpdate && !isAdminUpdate) {
    return jsonError("Admin access is required for this user update.", 403);
  }

  const updates: { first_name?: string; last_name?: string; status?: "active" | "suspended"; role?: "admin" | "subscriber" } = {};

  if (body.first_name) updates.first_name = body.first_name;
  if (body.last_name) updates.last_name = body.last_name;
  if (isAdminUpdate && body.status) updates.status = body.status;
  if (isAdminUpdate && body.role) updates.role = body.role;

  if (Object.keys(updates).length === 0) {
    return jsonError("Choose at least one user field to update.", 422);
  }

  const { data, error } = await auth.supabase
    .from("profiles")
    .update(updates)
    .eq("id", body.user_id)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}
