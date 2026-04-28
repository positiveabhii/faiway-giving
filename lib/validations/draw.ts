import { z } from "zod";

export const drawExecuteSchema = z.object({
  draw_id: z.string().uuid(),
  mode: z.enum(["random", "algorithmic"]),
});
