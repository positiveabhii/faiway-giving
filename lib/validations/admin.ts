import { z } from "zod";

export const adminUserUpdateSchema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string().trim().min(1).max(80).optional(),
  last_name: z.string().trim().min(1).max(80).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  role: z.enum(["admin", "subscriber"]).optional(),
});
