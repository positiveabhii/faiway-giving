import { NextRequest } from "next/server";
import { jsonError, jsonOk, parseJson, requireAuth } from "@/lib/server/api";
import { verifyPaymentSchema } from "@/lib/validations/payment";
import crypto from "crypto";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  // We allow requireAuth even if status is pending_payment because we handled that in requireAuth logic
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, verifyPaymentSchema);
  if (body instanceof Response) return body;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

  // Verify Signature
  const text = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return jsonError("Invalid payment signature. Verification failed.", 400);
  }

  // Payment verified! Perform TRUE activation using service role
  const supabase = auth.supabase;
  const writer = getSupabaseServiceRoleClient() ?? supabase;

  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + (plan === "yearly" ? 12 : 1));

  try {
    // 1. Activate Profile
    const { error: profileError } = await writer
      .from("profiles")
      .update({ status: "active" })
      .eq("id", auth.authUser.id);
    
    if (profileError) throw profileError;

    // 2. Activate & Initialize Subscription
    const { data: subscription, error: subError } = await writer
      .from("subscriptions")
      .upsert({
        user_id: auth.authUser.id,
        plan: plan,
        status: "active",
        next_renewal_date: renewalDate.toISOString(),
        payment_provider: "razorpay",
        payment_reference: razorpay_payment_id,
        cancelled_at: null,
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (subError) throw subError;

    // 3. Create Billing Transaction for audit
    const amount = plan === "yearly" ? 290 : 29;
    const { error: btError } = await writer
      .from("billing_transactions")
      .insert({
        user_id: auth.authUser.id,
        subscription_id: subscription.id,
        amount: amount,
        payment_provider: "razorpay",
        payment_reference: razorpay_payment_id,
        status: "captured",
        invoice_reference: `INV_${Date.now()}_${auth.authUser.id.slice(0, 8)}`,
      });

    if (btError) {
      console.error("[Payments] Billing Transaction Log Error:", btError);
    }

    return jsonOk({ success: true });
  } catch (err: any) {
    console.error("[Payments] Activation Error:", err);
    return jsonError(err.message || "Payment verified but account activation failed.", 500);
  }
}
