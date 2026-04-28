import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  first_name: z.string().trim().min(1, "First name is required.").max(80),
  last_name: z.string().trim().min(1, "Last name is required.").max(80),
  plan: z.enum(["monthly", "yearly"]),
  charity_id: z.string().uuid("Select a valid charity."),
  contribution_percentage: z.number().int().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Password is required."),
});
