import { z } from "zod";

export const createIntentSchema = z.object({
  orderId: z.string().uuid("ID de pedido inválido"),
  amount: z.number().positive("El monto debe ser positivo"),
  currency: z.string().length(3).default("eur"),
});
