import { z } from "zod";

export const addToCartSchema = z.object({
  variant_id: z.string().uuid("ID de variante inválido"),
  quantity: z.number().int().min(1).max(99),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(99), // 0 = remove
});

export const applyPromoSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
});

export const cartItemIdSchema = z.object({
  itemId: z.string().uuid(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ApplyPromoInput = z.infer<typeof applyPromoSchema>;
