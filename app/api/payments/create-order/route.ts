import { NextRequest } from "next/server";
import { jsonError, jsonOk, parseJson, requireAuth } from "@/lib/server/api";
import { createOrderSchema } from "@/lib/validations/payment";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, createOrderSchema);
  if (body instanceof Response) return body;

  try {
    const amountInDollars = body.plan === "yearly" ? 290 : 29;

    // Razorpay expects amount in paise (integers)
    // $29 = 2900 cents/paise (if using USD/INR as 1:1 for test, but typically INR)
    // The user mentioned INR in their request.
    const amountInPaise = amountInDollars * 100;

    // STRICT RULE: receipt must be <= 40 chars
    // sub_ + 8 chars of user id + _ + 10 chars of timestamp = ~24 chars (well within 40)
    const shortReceipt = `sub_${auth.authUser.id.slice(0, 8)}_${Date.now().toString().slice(-10)}`;

    const options = {
      amount: amountInPaise,
      currency: "USD",
      receipt: shortReceipt,
      notes: {
        userId: auth.authUser.id,
        plan: body.plan,
        type: "membership_signup"
      }
    };

    console.log("[Payments] Creating order with options:", JSON.stringify(options, null, 2));

    const order = await razorpay.orders.create(options);

    console.log("[Payments] Order created successfully:", order.id);

    return jsonOk({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("[Payments] Create Order Failed:", err);
    return jsonError(err.message || "Failed to create payment order.", 500);
  }
}
