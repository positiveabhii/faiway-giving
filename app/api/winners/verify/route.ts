import { jsonError, jsonOk, parseJson, requireAuth, requireAdmin } from "@/lib/server/api";
import { winnerVerifySchema } from "@/lib/validations/winner";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return handleProofUpload(request);
  }

  const body = await parseJson(request, winnerVerifySchema);
  if (body instanceof Response) return body;

  const writer = getSupabaseServiceRoleClient();
  console.log(`[POST] Service role client exists: ${!!writer}`);
  if (!writer) return jsonError("Service role client is not configured.", 500);

  if (body.action === "submit_proof") {
    const auth = await requireAuth();
    if ("response" in auth) return auth.response;

    // Ownership validation using auth client (Respects RLS)
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

    // Mutation using service role writer (Bypasses RLS)
    const { error: updateError } = await writer
      .from("draw_winners")
      .update({ proof_url: body.proof_url })
      .eq("id", winner.id);

    if (updateError) {
      console.error("[POST:submit_proof] draw_winners update failed:", updateError);
      return jsonError(updateError.message, 500);
    }

    const payload = {
      winner_id: winner.id,
      user_id: auth.authUser.id,
      status: "pending" as const,
      updated_at: new Date().toISOString()
    };
    console.log("[POST:submit_proof] Upserting into winner_verifications:", payload);

    const { data, error } = await writer
      .from("winner_verifications")
      .upsert(payload, { onConflict: "winner_id,user_id" })
      .select()
      .single();

    if (error) {
      console.error("[POST:submit_proof] winner_verifications upsert failed:", error);
      return jsonError(error.message, 500);
    }

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

    const { data, error } = await writer
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

    if (error) {
      console.error("[POST:approve] winner_verifications update failed:", error);
      return jsonError(error.message, 500);
    }

    const { error: winnerError } = await writer
      .from("draw_winners")
      .update({ payout_status: "verified" })
      .eq("id", data.winner_id)
      .eq("payout_status", "pending");

    if (winnerError) {
      console.error("[POST:approve] draw_winners update failed:", winnerError);
      return jsonError(winnerError.message, 500);
    }

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

    const { data, error } = await writer
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

    if (error) {
      console.error("[POST:reject] winner_verifications update failed:", error);
      return jsonError(error.message, 500);
    }

    return jsonOk(data);
  }

  // Action: Mark Paid
  const { error } = await writer
    .from("draw_winners")
    .update({ payout_status: "paid" })
    .eq("id", body.winner_id)
    .eq("payout_status", "verified");

  if (error) {
    console.error("[POST:paid] draw_winners update failed:", error);
    return jsonError(error.message, 500);
  }

  return jsonOk({ winner_id: body.winner_id });
}

async function handleProofUpload(request: Request) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const writer = getSupabaseServiceRoleClient();
  console.log(`[handleProofUpload] Service role client exists: ${!!writer}`);
  if (!writer) return jsonError("Service role client is not configured.", 500);

  const form = await request.formData();
  const winnerId = form.get("winner_id");
  const file = form.get("file");

  // Hard assertion for winnerId
  console.log("[handleProofUpload] Received winnerId:", winnerId);
  if (!winnerId || typeof winnerId !== "string") {
    console.error("[handleProofUpload] CRITICAL: winnerId is missing or invalid.");
    return jsonError("Winner id is required.", 422);
  }

  if (!(file instanceof File)) return jsonError("Proof file is required.", 422);
  if (file.size > 5 * 1024 * 1024) return jsonError("Proof file must be 5MB or less.", 422);

  // Ownership validation using auth client (Respects RLS)
  const { data: winner, error: winnerError } = await auth.supabase
    .from("draw_winners")
    .select("*")
    .eq("id", winnerId)
    .eq("user_id", auth.authUser.id)
    .maybeSingle();

  if (winnerError) return jsonError("Unable to verify this winning record.", 500);
  if (!winner) return jsonError("Winning record not found or access denied.", 404);

  // Payout status must be pending OR verified (if re-uploading)
  if (winner.payout_status === "paid") {
    return jsonError("This win has already been paid.", 409);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `proofs/${winnerId}/${Date.now()}_${safeName}`;

  // Storage upload using service role writer
  const { error: uploadError } = await writer.storage.from("winner-proofs").upload(path, file);
  console.log("[handleProofUpload] STEP 1: Uploading proof file to storage");
  if (uploadError) {
    console.error("[handleProofUpload] Storage upload failed:", uploadError);
    return jsonError(uploadError.message, 500);
  }

  const { data: publicUrlData } = writer.storage.from("winner-proofs").getPublicUrl(path);
  const proofUrl = publicUrlData.publicUrl;
  console.log("[handleProofUpload] Public URL generated:", proofUrl);

  // Mutation: Update draw_winners
  const { data: updatedWinner, error: updateError } = await writer
    .from("draw_winners")
    .update({
      proof_url: proofUrl,
      payout_status: "pending" // Reset status to pending if it was rejected/verified
    })
    .eq("id", winnerId)
    .eq("user_id", auth.authUser.id)
    .select()
    .single();

  console.log("[handleProofUpload] STEP 2: Updating draw_winners row:", updatedWinner);

  if (updateError || !updatedWinner || updatedWinner.proof_url !== proofUrl) {
    console.error("[handleProofUpload] draw_winners update validation failed:", updateError);
    return jsonError(updateError?.message || "Failed to persist proof URL to winning record.", 500);
  }

  // Stable Upsert for winner_verifications
  const payload = {
    winner_id: winnerId,
    user_id: auth.authUser.id,
    status: "pending" as const,
    updated_at: new Date().toISOString()
  };

  console.log("[handleProofUpload] STEP 3: Upserting winner_verifications:", payload);

  const { data, error } = await writer
    .from("winner_verifications")
    .upsert(payload, { onConflict: "winner_id,user_id" })
    .select()
    .single();

  if (error) {
    console.error("[handleProofUpload] winner_verifications upsert failed:", error);
    return jsonError(error.message, 500);
  }

  console.log("[handleProofUpload] Final Success - Verification state stabilized.");
  return jsonOk(data, { status: 201 });
}
// .upsert(payload, { onConflict: "winner_id,user_id" })