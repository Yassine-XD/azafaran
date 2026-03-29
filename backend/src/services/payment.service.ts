/**
 * Payment Service
 */

import { AppError } from "../types/api";
import stripe from "../config/stripe";
import orderRepository from "../repositories/order.repository";
import notificationService from "./notification.service";
import logger from "../utils/logger";

class PaymentService {
  async createPaymentIntent(userId: string, data: any) {
    const { amount, orderId, currency = "USD" } = data;

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
      throw new AppError("Payment processing failed", 400);
    }
  }

  async getPaymentStatus(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return { status: order.payment_status };
  }

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
      throw new AppError("Refund processing failed", 400);
    }
  }

  async handleStripeWebhook(body: any, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSuccess(event.data.object as any);
          break;
        case "payment_intent.payment_failed":
          await this.handlePaymentFailure(event.data.object as any);
          break;
      }

      return { received: true };
    } catch (error) {
      logger.error("Webhook error:", error);
      throw new AppError("Webhook processing failed", 400);
    }
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    const { userId, orderId } = paymentIntent.metadata;
    await orderRepository.update(orderId, { payment_status: "completed" });
    await notificationService.sendNotification(userId, {
      title: "Payment Successful",
      message: "Your payment has been processed successfully",
      type: "payment",
    });
  }

  private async handlePaymentFailure(paymentIntent: any) {
    const { userId, orderId } = paymentIntent.metadata;
    await orderRepository.update(orderId, { payment_status: "failed" });
    await notificationService.sendNotification(userId, {
      title: "Payment Failed",
      message: "Your payment could not be processed. Please try again.",
      type: "payment",
    });
  }
}

export default new PaymentService();
