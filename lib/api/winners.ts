import { apiForm, apiJson } from "@/lib/api/client";
import type { WinnerVerifyRequest } from "@/types/api";
import type { WinnerVerification } from "@/types/database";

export function submitWinnerProof(winnerId: string, file: File) {
  const form = new FormData();
  form.set("winner_id", winnerId);
  form.set("file", file);
  return apiForm<WinnerVerification>("/api/winners/verify", form);
}

export function approveWinnerVerification(verificationId: string) {
  return apiJson<WinnerVerification, WinnerVerifyRequest>("/api/winners/verify", "POST", {
    action: "approve",
    verification_id: verificationId,
  });
}

export function rejectWinnerVerification(verificationId: string, notes?: string) {
  return apiJson<WinnerVerification, WinnerVerifyRequest>("/api/winners/verify", "POST", {
    action: "reject",
    verification_id: verificationId,
    notes,
  });
}

export function markWinnerPaid(winnerId: string) {
  return apiJson<{ winner_id: string }, WinnerVerifyRequest>("/api/winners/verify", "POST", {
    action: "mark_paid",
    winner_id: winnerId,
  });
}
