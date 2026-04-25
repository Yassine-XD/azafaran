import { ExpoPushMessage } from "expo-server-sdk";
import { notificationRepository } from "../repositories/notification.repository";
import { expoPush } from "./expoPush.service";
import { logger } from "../utils/logger";

// ─── Deep-link payload contract ─────────────────────
// This is the canonical shape sent in Expo `data` and persisted in
// notification_log.data. The frontend has a single switch on `type`.
export type NotificationPayload = {
  v: 1;
  type: "screen" | "product" | "coupon" | "order" | "campaign" | "none";
  screen?: string;
  productId?: string;
  promoCode?: string;
  orderId?: string;
  logId?: string;
  campaignId?: string;
  imageUrl?: string;
};

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

type DispatchTarget = {
  userId: string;
  pushTokenId: string;
  token: string;
};

type DispatchInput = {
  eventType: string;
  title: string;
  body: string;
  payload: NotificationPayload;
  campaignId?: string;
  orderId?: string;
  imageUrl?: string;
};

// Build messages, persist log rows, send via Expo, persist receipt IDs / failures.
async function dispatchToTokens(
  targets: DispatchTarget[],
  input: DispatchInput,
) {
  if (targets.length === 0) return { sent: 0, failed: 0 };

  // Create one log row per (user, token), so we can stamp logId into the
  // device payload (used by the device to POST /notifications/opened/:logId).
  const logs = await Promise.all(
    targets.map((t) =>
      notificationRepository.createLog({
        userId: t.userId,
        pushTokenId: t.pushTokenId,
        campaignId: input.campaignId,
        orderId: input.orderId,
        eventType: input.eventType,
        title: input.title,
        body: input.body,
        notifData: input.payload,
      }),
    ),
  );

  const messages: ExpoPushMessage[] = [];
  const validIndexes: number[] = [];

  targets.forEach((t, i) => {
    if (!expoPush.isExpoPushToken(t.token)) {
      // Not an Expo token — mark log failed and deactivate.
      notificationRepository
        .updateLogStatus(logs[i].id, "failed", "Invalid Expo push token")
        .catch(() => {});
      notificationRepository.deactivateByToken(t.token).catch(() => {});
      return;
    }
    const data: NotificationPayload = { ...input.payload, logId: logs[i].id };
    const msg: ExpoPushMessage = {
      to: t.token,
      sound: "default",
      title: input.title,
      body: input.body,
      data,
    };
    if (input.imageUrl) {
      // Rich notification (Android big-picture / iOS attachment).
      (msg as any).richContent = { image: input.imageUrl };
    }
    messages.push(msg);
    validIndexes.push(i);
  });

  if (messages.length === 0) return { sent: 0, failed: targets.length };

  const tickets = await expoPush.sendChunked(messages);

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const log = logs[validIndexes[i]];
    if (ticket.status === "ok") {
      await notificationRepository.updateReceiptId(log.id, ticket.id);
      sent++;
    } else {
      const detailsErr = (ticket.details as { error?: string } | undefined)?.error;
      await notificationRepository.updateLogStatus(
        log.id,
        "failed",
        ticket.message || detailsErr || "Expo error",
      );
      if (detailsErr === "DeviceNotRegistered") {
        await notificationRepository.deactivateByToken(
          targets[validIndexes[i]].token,
        );
      }
      failed++;
    }
  }
  return { sent, failed };
}

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
      email_notifications?: boolean;
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

    const tokens = await notificationRepository.findActivePushTokens(userId);
    const payload: NotificationPayload = { v: 1, type: "order", orderId };

    if (tokens.length === 0) {
      // Still log so the in-app notification history shows the event.
      await notificationRepository.createLog({
        userId,
        orderId,
        eventType,
        title: template.title,
        body: template.body,
        notifData: payload,
      });
      logger.debug(`No active push tokens for user ${userId}`);
      return;
    }

    const targets = tokens.map((t) => ({
      userId,
      pushTokenId: t.id,
      token: t.token,
    }));

    const result = await dispatchToTokens(targets, {
      eventType,
      title: template.title,
      body: template.body,
      payload,
      orderId,
    });
    logger.info(
      `Order push ${eventType} for user ${userId}: sent=${result.sent} failed=${result.failed}`,
    );
  },

  // Send a custom (admin one-off or campaign) notification to a list of users.
  async sendCustomNotification(opts: {
    userIds: string[];
    title: string;
    body: string;
    payload: NotificationPayload;
    campaignId?: string;
    imageUrl?: string;
    eventType?: string;
  }) {
    if (opts.userIds.length === 0) return { sent: 0, failed: 0, logged: 0 };

    // Build a flat list of (user, token) targets in a single query.
    const allTargets: DispatchTarget[] = [];
    let loggedNoToken = 0;
    for (const userId of opts.userIds) {
      const tokens = await notificationRepository.findActivePushTokens(userId);
      if (tokens.length === 0) {
        // Log without push so the user has an in-app history.
        await notificationRepository.createLog({
          userId,
          campaignId: opts.campaignId,
          eventType: opts.eventType || opts.payload.type,
          title: opts.title,
          body: opts.body,
          notifData: opts.payload,
        });
        loggedNoToken++;
        continue;
      }
      for (const t of tokens) {
        allTargets.push({ userId, pushTokenId: t.id, token: t.token });
      }
    }

    const result = await dispatchToTokens(allTargets, {
      eventType: opts.eventType || opts.payload.type,
      title: opts.title,
      body: opts.body,
      payload: opts.payload,
      campaignId: opts.campaignId,
      imageUrl: opts.imageUrl,
    });
    return { ...result, logged: loggedNoToken };
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
