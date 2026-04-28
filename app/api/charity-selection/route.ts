import { jsonError, jsonOk, parseJson, requireAuth } from "@/lib/server/api";
import { charitySelectionSchema } from "@/lib/validations/charity";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, charitySelectionSchema);
  if (body instanceof Response) return body;

  const { data: charity, error: charityError } = await auth.supabase
    .from("charities")
    .select("id")
    .eq("id", body.charity_id)
    .maybeSingle();

  if (charityError) return jsonError("Unable to validate that charity.", 500);
  if (!charity) return jsonError("Choose an active charity before saving.", 422);

  const { data, error } = await writer
    .from("user_charity_selections")
    .upsert({
      user_id: auth.authUser.id,
      charity_id: body.charity_id,
      contribution_percentage: body.contribution_percentage,
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}
