import { notificationRepository } from "../repositories/notification.repository";
import { logger } from "../utils/logger";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

// Event type → user-facing notification text (Spanish)
const ORDER_EVENT_MESSAGES: Record<string, { title: string; body: string }> = {
  order_confirmed: {
    title: "Pedido confirmado",
    body: "Tu pedido ha sido confirmado y está siendo procesado.",
  },
  order_preparing: {
    title: "Preparando tu pedido",
    body: "Estamos preparando tu pedido con productos frescos.",
  },
  order_shipped: {
    title: "Pedido en camino",
    body: "Tu pedido está en camino. ¡Prepárate para recibirlo!",
  },
  order_delivered: {
    title: "Pedido entregado",
    body: "Tu pedido ha sido entregado. ¡Buen provecho!",
  },
  order_cancelled: {
    title: "Pedido cancelado",
    body: "Tu pedido ha sido cancelado.",
  },
};

export const notificationService = {
  // ─── Push Token Management ──────────────────────────

  async registerToken(
    userId: string,
    token: string,
    platform: "ios" | "android",
  ) {
    return notificationRepository.savePushToken(userId, token, platform);
  },

  async unregisterToken(userId: string, token: string) {
    await notificationRepository.deletePushToken(userId, token);
  },

  // ─── Notification Preferences ───────────────────────

  async getPreferences(userId: string) {
    return notificationRepository.findOrCreatePreferences(userId);
  },

  async updatePreferences(
    userId: string,
    data: {
      order_updates?: boolean;
      reorder_reminders?: boolean;
      promotions?: boolean;
      ai_suggestions?: boolean;
    },
  ) {
    return notificationRepository.updatePreferences(userId, data);
  },

  // ─── Send Notifications ─────────────────────────────

  async sendOrderNotification(
    userId: string,
    eventType: string,
    orderId: string,
  ) {
    const template = ORDER_EVENT_MESSAGES[eventType];
    if (!template) {
      logger.warn(`Unknown order event type: ${eventType}`);
      return;
    }

    // Get user's push tokens
    const tokens = await notificationRepository.findActivePushTokens(userId);

    if (tokens.length === 0) {
      logger.debug(`No active push tokens for user ${userId}`);
      // Still log the notification
      await notificationRepository.createLog({
        userId,
        orderId,
        eventType,
        title: template.title,
        body: template.body,
        notifData: { orderId, eventType },
      });
      return;
    }

    // Send to each token via Expo
    for (const pushToken of tokens) {
      const logEntry = await notificationRepository.createLog({
        userId,
        pushTokenId: pushToken.id,
        orderId,
        eventType,
        title: template.title,
        body: template.body,
        notifData: { orderId, eventType },
      });

      try {
        // TODO: Replace with actual Expo push when expo-server-sdk is installed
        // const ticket = await expo.sendPushNotificationsAsync([{
        //   to: pushToken.token,
        //   title: template.title,
        //   body: template.body,
        //   data: { orderId, eventType },
        // }]);
        // await notificationRepository.updateLogStatus(logEntry.id, 'delivered');
        logger.info(
          `Push notification queued for user ${userId}: ${eventType}`,
        );
      } catch (err) {
        logger.error(`Failed to send push to ${pushToken.token}:`, err);
        await notificationRepository.updateLogStatus(
          logEntry.id,
          "failed",
          (err as Error).message,
        );
      }
    }
  },

  // ─── Notification History ───────────────────────────

  async getNotifications(userId: string, page: number, limit: number) {
    const { rows, total } = await notificationRepository.findLogsByUserId(
      userId,
      page,
      limit,
    );
    return {
      notifications: rows,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async markOpened(logId: string) {
    await notificationRepository.markOpened(logId);
  },
};
