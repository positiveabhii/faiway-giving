import { z } from "zod";

export const drawExecuteSchema = z.object({
  draw_id: z.string().uuid(),
  mode: z.enum(["random", "algorithmic"]),
  lucky_numbers: z.array(z.number().int().min(1).max(45)).length(5).optional(),
});
