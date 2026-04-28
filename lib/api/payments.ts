import { apiJson } from "@/lib/api/client";
import type { PaymentOrderRequest, PaymentOrderResponse, PaymentVerifyRequest } from "@/types/api";

export function createPaymentOrder(data: PaymentOrderRequest) {
  return apiJson<PaymentOrderResponse, PaymentOrderRequest>("/api/payments/create-order", "POST", data);
}

export function verifyPayment(data: PaymentVerifyRequest) {
  return apiJson<{ success: true }, PaymentVerifyRequest>("/api/payments/verify", "POST", data);
}
