import { z } from "zod";

export const notificationReadSchema = z.object({
  notification_id: z.string().uuid().optional(),
  all: z.boolean().optional(),
}).refine((value) => value.notification_id || value.all, {
  message: "Choose at least one notification to mark as read.",
});
