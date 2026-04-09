import { z } from "zod";

export const createIntentSchema = z.object({
  orderId: z.string().uuid("ID de pedido inválido"),
  currency: z.string().length(3).default("eur"),
});
