import { z } from "zod";

export const createPromotionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  discount_type: z.enum(["percent", "fixed", "free_delivery"]),
  discount_value: z.number().min(0),
  min_purchase: z.number().min(0).default(0),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
