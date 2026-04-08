import { z } from "zod";

export const placeOrderSchema = z.object({
  address_id: z.string().uuid("Dirección inválida"),
  payment_method: z.enum(["card", "cash", "bizum"]),
  payment_ref: z.string().optional(), // Stripe PaymentIntent id
  delivery_notes: z.string().max(500).optional(),
  promo_code: z.string().max(50).optional(),
});

export const reviewOrderSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "confirmed",
    "preparing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export const orderIdSchema = z.object({
  id: z.string().uuid("ID de pedido inválido"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type ReviewOrderInput = z.infer<typeof reviewOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
