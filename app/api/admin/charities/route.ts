import { jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/server/api";
import { charityDeleteSchema, charityWriteSchema } from "@/lib/validations/charity";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, charityWriteSchema);
  if (body instanceof Response) return body;

  const charity = {
    name: body.name,
    mission: body.mission,
    image_url: body.image_url,
    tags: body.tags,
    is_spotlight: body.is_spotlight,
    upcoming_events: body.upcoming_events,
  };
  const { data, error } = await writer
    .from("charities")
    .insert(charity)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, charityWriteSchema.required({ id: true }));
  if (body instanceof Response) return body;

  const { id, ...updates } = body;
  const { data, error } = await writer
    .from("charities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  if (!writer) return jsonError("Server configuration error: Service role client unavailable.", 500);

  const body = await parseJson(request, charityDeleteSchema);
  if (body instanceof Response) return body;

  const { error } = await writer
    .from("charities")
    .delete()
    .eq("id", body.id);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ id: body.id });
}
