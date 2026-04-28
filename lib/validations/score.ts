import { z } from "zod";

export const scoreCreateSchema = z.object({
  score_value: z.number().int().min(1, "Score must be between 1 and 45.").max(45, "Score must be between 1 and 45."),
  played_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid score date."),
});

export const scoreDeleteSchema = z.object({
  score_id: z.string().uuid(),
});
