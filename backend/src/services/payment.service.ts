import stripe from "../config/stripe";
import { orderRepository } from "../repositories/order.repository";
import { cartRepository } from "../repositories/cart.repository";
import { notificationService } from "./notification.service";
import { env } from "../config/env";
import { logger } from "../utils/logger";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

export const paymentService = {
  async createPaymentIntent(
    userId: string,
    orderId: string,
    currency = "eur",
  ) {
    // Verify order belongs to user and is pending payment
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");
    }
    if (order.payment_status === "paid") {
      throw appError("Este pedido ya está pagado", 400, "ALREADY_PAID");
    }

    // Use server-side order total — never trust client-sent amount
    const orderTotal = parseFloat(order.total);
    if (orderTotal < 0.5) {
      throw appError(
        "El total del pedido es inferior al mínimo permitido",
        400,
        "AMOUNT_TOO_LOW",
      );
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(orderTotal * 100), // Stripe uses cents
        currency: currency.toLowerCase(),
        metadata: { userId, orderId },
      },
      { idempotencyKey: `pi_${orderId}` },
    );

    // Store the payment intent ID on the order
    await orderRepository.updatePaymentStatus(
      orderId,
      "pending",
      paymentIntent.id,
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },

  async getPaymentStatus(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");
    }
    return {
      payment_status: order.payment_status,
      payment_ref: order.payment_ref,
    };
  },

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw appError(
        "Webhook secret not configured",
        500,
        "WEBHOOK_NOT_CONFIGURED",
      );
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );

    logger.info(`Stripe webhook received: ${event.type}`);

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const pi = event.data.object;
          const { userId, orderId } = pi.metadata;
          if (orderId) {
            // Guard: don't resurrect cancelled orders
            const order = await orderRepository.findById(orderId);
            if (order && order.status !== "cancelled") {
              await orderRepository.updatePaymentStatus(
                orderId,
                "paid",
                pi.id,
              );
              await orderRepository.updateStatus(orderId, "confirmed");
              // Clear cart now that card payment is confirmed
              if (userId) {
                const cart = await cartRepository.findOrCreateCart(userId);
                await cartRepository.clearCart(cart.id);
                await notificationService.sendOrderNotification(
                  userId,
                  "order_confirmed",
                  orderId,
                );
              }
            } else {
              logger.warn(
                `Webhook: skipped confirming order ${orderId} (status: ${order?.status})`,
              );
            }
          }
          break;
        }
        case "payment_intent.payment_failed": {
          const pi = event.data.object;
          const { userId, orderId } = pi.metadata;
          if (orderId) {
            await orderRepository.updatePaymentStatus(
              orderId,
              "failed",
              pi.id,
            );
            if (userId) {
              await notificationService.sendOrderNotification(
                userId,
                "order_cancelled",
                orderId,
              );
            }
          }
          break;
        }
      }
    } catch (err) {
      // Log but don't throw — always acknowledge receipt to prevent Stripe retries
      logger.error("Webhook processing error", err);
    }

    return { received: true };
  },
};
