import { jsonError, jsonOk, parseJson, requireAuth, requireAdmin } from "@/lib/server/api";
import { adminUserUpdateSchema } from "@/lib/validations/admin";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  // Fetch profiles with subscription, charity selection, and counts
  const { data: users, error } = await auth.supabase
    .from("profiles")
    .select(`
      *,
      subscriptions (plan, status),
      user_charity_selections (charities (name)),
      golf_scores (id),
      draw_winners (id)
    `)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  // Transform to match the requested format
  const formattedUsers = users.map((u: any) => ({
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    subscription: u.subscriptions?.[0] || null,
    selected_charity: u.user_charity_selections?.[0]?.charities?.name || "None",
    total_scores: u.golf_scores?.length || 0,
    total_wins: u.draw_winners?.length || 0
  }));

  return jsonOk(formattedUsers);
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, adminUserUpdateSchema);
  if (body instanceof Response) return body;

  const isSelfNameUpdate = body.user_id === auth.authUser.id && !body.status && !body.role;
  const isAdminUpdate = auth.profile.role === "admin";

  if (!isSelfNameUpdate && !isAdminUpdate) {
    return jsonError("Admin access is required for this user update.", 403);
  }

  const updates: { first_name?: string; last_name?: string; status?: "active" | "suspended" | "pending_payment"; role?: "admin" | "subscriber" } = {};

  if (body.first_name) updates.first_name = body.first_name;
  if (body.last_name) updates.last_name = body.last_name;
  if (isAdminUpdate && body.status) updates.status = body.status as any;
  if (isAdminUpdate && body.role) updates.role = body.role;

  if (Object.keys(updates).length === 0) {
    return jsonError("Choose at least one user field to update.", 422);
  }

  const { data, error } = await writer
    .from("profiles")
    .update(updates)
    .eq("id", body.user_id)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}
