import { z } from "zod";

export const winnerVerifySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("submit_proof"),
    winner_id: z.string().uuid(),
    proof_url: z.string().url().optional(),
  }),
  z.object({
    action: z.literal("approve"),
    verification_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("reject"),
    verification_id: z.string().uuid(),
    notes: z.string().trim().max(1000).optional(),
  }),
  z.object({
    action: z.literal("mark_paid"),
    winner_id: z.string().uuid(),
  }),
]);
