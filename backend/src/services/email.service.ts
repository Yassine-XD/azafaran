import { sendMail } from "../config/mailer";
import { env } from "../config/env";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import { notificationRepository } from "../repositories/notification.repository";
import { logger } from "../utils/logger";
import {
  welcomeEmail,
  orderConfirmationEmail,
  invoiceEmail,
  orderStatusEmail,
  reviewRequestEmail,
  campaignEmail,
  adminNewOrderEmail,
  adminNewReviewEmail,
  adminErrorEmail,
} from "../emails/templates";

async function hasEmailEnabled(userId: string): Promise<boolean> {
  const prefs = await notificationRepository.findOrCreatePreferences(userId);
  return prefs.email_notifications !== false;
}

export const emailService = {
  // ─── Client emails ─────────────────────────────────

  async sendWelcomeEmail(userId: string) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) return;

      const { subject, html } = welcomeEmail(user);
      await sendMail(user.email, subject, html);
    } catch (err) {
      logger.error(`Failed to send welcome email to user ${userId}:`, err);
    }
  },

  async sendOrderConfirmation(orderId: string) {
    try {
      const order = await orderRepository.findById(orderId);
      if (!order) return;

      const user = await userRepository.findById(order.user_id);
      if (!user) return;

      if (!(await hasEmailEnabled(user.id))) return;

      const orderData = {
        order_number: order.order_number,
        subtotal: parseFloat(order.subtotal),
        delivery_fee: parseFloat(order.delivery_fee),
        discount_amount: parseFloat(order.discount_amount),
        total: parseFloat(order.total),
        address_snapshot: order.address_snapshot,
        delivery_notes: order.delivery_notes,
        items: order.items.map((item: any) => ({
          product_snapshot: item.product_snapshot,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          line_total: parseFloat(item.line_total),
        })),
      };

      // Send order confirmation
      const confirmation = orderConfirmationEmail(orderData, user);
      await sendMail(user.email, confirmation.subject, confirmation.html);

      // Send invoice
      const invoice = invoiceEmail(orderData, user);
      await sendMail(user.email, invoice.subject, invoice.html);
    } catch (err) {
      logger.error(
        `Failed to send order confirmation for order ${orderId}:`,
        err,
      );
    }
  },

  async sendOrderStatusUpdate(orderId: string, status: string) {
    try {
      const order = await orderRepository.findById(orderId);
      if (!order) return;

      const user = await userRepository.findById(order.user_id);
      if (!user) return;

      if (!(await hasEmailEnabled(user.id))) return;

      const { subject, html } = orderStatusEmail(
        { order_number: order.order_number },
        user,
        status,
      );
      await sendMail(user.email, subject, html);
    } catch (err) {
      logger.error(
        `Failed to send status update email for order ${orderId}:`,
        err,
      );
    }
  },

  async sendReviewRequest(orderId: string) {
    try {
      const order = await orderRepository.findById(orderId);
      if (!order) return;

      const user = await userRepository.findById(order.user_id);
      if (!user) return;

      if (!(await hasEmailEnabled(user.id))) return;

      const { subject, html } = reviewRequestEmail(
        { order_number: order.order_number },
        user,
      );
      await sendMail(user.email, subject, html);
    } catch (err) {
      logger.error(
        `Failed to send review request email for order ${orderId}:`,
        err,
      );
    }
  },

  async sendCampaignEmail(
    userId: string,
    campaign: {
      title: string;
      body: string;
      image_url?: string;
      deep_link?: string;
    },
  ) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) return;

      if (!(await hasEmailEnabled(user.id))) return;

      const { subject, html } = campaignEmail(campaign);
      await sendMail(user.email, subject, html);
    } catch (err) {
      logger.error(
        `Failed to send campaign email to user ${userId}:`,
        err,
      );
    }
  },

  // ─── Admin emails ──────────────────────────────────

  async notifyAdminNewOrder(orderId: string) {
    try {
      if (!env.ADMIN_EMAIL) return;

      const order = await orderRepository.findById(orderId);
      if (!order) return;

      const user = await userRepository.findById(order.user_id);
      if (!user) return;

      const { subject, html } = adminNewOrderEmail(
        {
          order_number: order.order_number,
          total: parseFloat(order.total),
          payment_method: order.payment_method,
        },
        user,
      );
      await sendMail(env.ADMIN_EMAIL, subject, html);
    } catch (err) {
      logger.error(
        `Failed to send admin new order email for order ${orderId}:`,
        err,
      );
    }
  },

  async notifyAdminNewReview(data: {
    orderId: string;
    userId: string;
    rating: number;
    comment?: string;
  }) {
    try {
      if (!env.ADMIN_EMAIL) return;

      const user = await userRepository.findById(data.userId);
      if (!user) return;

      const order = await orderRepository.findById(data.orderId);
      if (!order) return;

      const { subject, html } = adminNewReviewEmail(
        { rating: data.rating, comment: data.comment },
        user,
        { order_number: order.order_number },
      );
      await sendMail(env.ADMIN_EMAIL, subject, html);
    } catch (err) {
      logger.error("Failed to send admin new review email:", err);
    }
  },

  async notifyAdminError(data: {
    message: string;
    stack?: string;
    url?: string;
    component?: string;
    userAgent?: string;
  }) {
    try {
      if (!env.ADMIN_EMAIL) return;

      const { subject, html } = adminErrorEmail(data);
      await sendMail(env.ADMIN_EMAIL, subject, html);
    } catch (err) {
      logger.error("Failed to send admin error email:", err);
    }
  },
};
