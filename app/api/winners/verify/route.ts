import { jsonError, jsonOk, parseJson, requireAuth, requireAdmin } from "@/lib/server/api";
import { winnerVerifySchema } from "@/lib/validations/winner";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return handleProofUpload(request);
  }

  const body = await parseJson(request, winnerVerifySchema);
  if (body instanceof Response) return body;

  if (body.action === "submit_proof") {
    const auth = await requireAuth();
    if ("response" in auth) return auth.response;

    const { data: winner, error: winnerError } = await auth.supabase
      .from("draw_winners")
      .select("*")
      .eq("id", body.winner_id)
      .eq("user_id", auth.authUser.id)
      .maybeSingle();

    if (winnerError) return jsonError("Unable to verify this winning record.", 500);
    if (!winner) return jsonError("Winning record not found.", 404);
    if (winner.payout_status !== "pending") return jsonError("Only pending winnings can be submitted for verification.", 409);
    if (!body.proof_url) return jsonError("Proof upload is required.", 422);

    const { error: updateError } = await auth.supabase
      .from("draw_winners")
      .update({ proof_url: body.proof_url })
      .eq("id", winner.id)
      .eq("user_id", auth.authUser.id);

    if (updateError) return jsonError(updateError.message, 500);

    const { data, error } = await auth.supabase
      .from("winner_verifications")
      .insert({ winner_id: winner.id, user_id: auth.authUser.id })
      .select()
      .single();

    if (error) return jsonError(error.message, 500);
    return jsonOk(data, { status: 201 });
  }

  const admin = await requireAdmin();
  if ("response" in admin) return admin.response;

  if (body.action === "approve") {
    const { data: existing, error: existingError } = await admin.supabase
      .from("winner_verifications")
      .select("*")
      .eq("id", body.verification_id)
      .maybeSingle();

    if (existingError) return jsonError("Unable to load verification.", 500);
    if (!existing) return jsonError("Verification not found.", 404);
    if (existing.status !== "pending") return jsonError("Only pending verifications can be approved.", 409);

    const { data, error } = await admin.supabase
      .from("winner_verifications")
      .update({
        status: "approved",
        admin_id: admin.authUser.id,
        verified_at: new Date().toISOString(),
      })
      .eq("id", body.verification_id)
      .eq("status", "pending")
      .select()
      .single();

    if (error) return jsonError(error.message, 500);

    const { error: winnerError } = await admin.supabase
      .from("draw_winners")
      .update({ payout_status: "verified" })
      .eq("id", data.winner_id)
      .eq("payout_status", "pending");

    if (winnerError) return jsonError(winnerError.message, 500);
    return jsonOk(data);
  }

  if (body.action === "reject") {
    const { data: existing, error: existingError } = await admin.supabase
      .from("winner_verifications")
      .select("id, status")
      .eq("id", body.verification_id)
      .maybeSingle();

    if (existingError) return jsonError("Unable to load verification.", 500);
    if (!existing) return jsonError("Verification not found.", 404);
    if (existing.status !== "pending") return jsonError("Only pending verifications can be rejected.", 409);

    const { data, error } = await admin.supabase
      .from("winner_verifications")
      .update({
        status: "rejected",
        admin_id: admin.authUser.id,
        notes: body.notes ?? null,
        verified_at: new Date().toISOString(),
      })
      .eq("id", body.verification_id)
      .eq("status", "pending")
      .select()
      .single();

    if (error) return jsonError(error.message, 500);
    return jsonOk(data);
  }

  const { error } = await admin.supabase
    .from("draw_winners")
    .update({ payout_status: "paid" })
    .eq("id", body.winner_id)
    .eq("payout_status", "verified");

  if (error) return jsonError(error.message, 500);
  return jsonOk({ winner_id: body.winner_id });
}

async function handleProofUpload(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const form = await request.formData();
  const winnerId = form.get("winner_id");
  const file = form.get("file");

  if (typeof winnerId !== "string") return jsonError("Winner id is required.", 422);
  if (!(file instanceof File)) return jsonError("Proof file is required.", 422);
  if (file.size > 5 * 1024 * 1024) return jsonError("Proof file must be 5MB or less.", 422);

  const { data: winner, error: winnerError } = await auth.supabase
    .from("draw_winners")
    .select("*")
    .eq("id", winnerId)
    .eq("user_id", auth.authUser.id)
    .maybeSingle();

  if (winnerError) return jsonError("Unable to verify this winning record.", 500);
  if (!winner) return jsonError("Winning record not found.", 404);
  if (winner.payout_status !== "pending") return jsonError("Only pending winnings can be submitted for verification.", 409);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `proofs/${winnerId}/${Date.now()}_${safeName}`;
  const { error: uploadError } = await auth.supabase.storage.from("winner-proofs").upload(path, file);
  if (uploadError) return jsonError(uploadError.message, 500);

  const { data: publicUrlData } = auth.supabase.storage.from("winner-proofs").getPublicUrl(path);
  const proofUrl = publicUrlData.publicUrl;

  const { error: updateError } = await auth.supabase
    .from("draw_winners")
    .update({ proof_url: proofUrl })
    .eq("id", winnerId)
    .eq("user_id", auth.authUser.id);

  if (updateError) return jsonError(updateError.message, 500);

  const { data, error } = await auth.supabase
    .from("winner_verifications")
    .insert({ winner_id: winnerId, user_id: auth.authUser.id })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, { status: 201 });
}
