/**
 * Payment Service
 */

import { AppError } from "../types/api";
import stripe from "../config/stripe";
import { orderRepository } from "../repositories/order.repository";
import { notificationService } from "./notification.service";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export const paymentService = {
  async createPaymentIntent(userId: string, data: { amount: number; orderId: string; currency?: string }) {
    const { amount, orderId, currency = "EUR" } = data;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: { userId, orderId },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      };
    } catch (error) {
      logger.error("Stripe error:", error);
      throw new AppError("Error al procesar el pago", 400, "PAYMENT_FAILED");
    }
  },

  async getPaymentStatus(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");
    return { status: order.payment_status };
  },

  async refund(userId: string, paymentIntentId: string, reason: string) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        metadata: { userId, reason },
      });

      logger.info(`Refund processed: ${refund.id}`);
      return { refundId: refund.id, status: refund.status };
    } catch (error) {
      logger.error("Refund error:", error);
      throw new AppError("Error al procesar el reembolso", 400, "REFUND_FAILED");
    }
  },

  async handleStripeWebhook(body: any, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET || "",
      );

      switch (event.type) {
        case "payment_intent.succeeded":
          await paymentService._handlePaymentSuccess(event.data.object as any);
          break;
        case "payment_intent.payment_failed":
          await paymentService._handlePaymentFailure(event.data.object as any);
          break;
      }

      return { received: true };
    } catch (error) {
      logger.error("Webhook error:", error);
      throw new AppError("Error al procesar webhook", 400, "WEBHOOK_FAILED");
    }
  },

  async _handlePaymentSuccess(paymentIntent: any) {
    const { userId, orderId } = paymentIntent.metadata;
    await orderRepository.updatePaymentStatus(orderId, "completed", paymentIntent.id);
    await notificationService.sendNotification(userId, {
      title: "Pago confirmado",
      message: "Tu pago ha sido procesado correctamente",
      type: "payment",
    });
  },

  async _handlePaymentFailure(paymentIntent: any) {
    const { userId, orderId } = paymentIntent.metadata;
    await orderRepository.updatePaymentStatus(orderId, "failed");
    await notificationService.sendNotification(userId, {
      title: "Pago fallido",
      message: "No se ha podido procesar tu pago. Inténtalo de nuevo.",
      type: "payment",
    });
  },
};
