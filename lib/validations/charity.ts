import { z } from "zod";

export const charitySelectionSchema = z.object({
  charity_id: z.string().uuid("Select a valid charity."),
  contribution_percentage: z.number().int().min(1).max(100),
});

export const charityWriteSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(160),
  mission: z.string().trim().min(1).max(1200),
  image_url: z.string().trim().url(),
  tags: z.array(z.string().trim().min(1).max(40)).max(8),
  is_spotlight: z.boolean(),
  upcoming_events: z.number().int().nonnegative().optional(),
});

export const charityDeleteSchema = z.object({
  id: z.string().uuid(),
});
