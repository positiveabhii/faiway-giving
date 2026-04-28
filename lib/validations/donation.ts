import { z } from "zod";

export const donationCreateSchema = z.object({
  charity_id: z.string().uuid("Select a valid charity."),
  amount: z.number().positive("Donation amount must be greater than zero.").max(100000),
});
