import { z } from "zod";

export const subscriptionManageSchema = z.object({
  user_id: z.string().uuid().optional(),
  plan: z.enum(["monthly", "yearly"]).optional(),
  status: z.enum(["active", "canceled", "past_due"]).optional(),
}).refine((value) => value.plan || value.status, {
  message: "Choose a subscription change to apply.",
});
