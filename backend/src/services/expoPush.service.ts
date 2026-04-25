import {
  Expo,
  ExpoPushMessage,
  ExpoPushTicket,
  ExpoPushReceiptId,
  ExpoPushReceipt,
} from "expo-server-sdk";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const expo = new Expo(
  env.EXPO_ACCESS_TOKEN ? { accessToken: env.EXPO_ACCESS_TOKEN } : {},
);

export const expoPush = {
  isExpoPushToken(token: string): boolean {
    return Expo.isExpoPushToken(token);
  },

  async sendChunked(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
    if (messages.length === 0) return [];
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];
    for (const chunk of chunks) {
      try {
        const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...chunkTickets);
      } catch (err) {
        logger.error("Expo sendPushNotificationsAsync chunk failed:", err);
        for (let i = 0; i < chunk.length; i++) {
          tickets.push({
            status: "error",
            message: (err as Error).message,
          } as ExpoPushTicket);
        }
      }
    }
    return tickets;
  },

  async getReceipts(
    ids: ExpoPushReceiptId[],
  ): Promise<Record<string, ExpoPushReceipt>> {
    if (ids.length === 0) return {};
    const chunks = expo.chunkPushNotificationReceiptIds(ids);
    const all: Record<string, ExpoPushReceipt> = {};
    for (const chunk of chunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        Object.assign(all, receipts);
      } catch (err) {
        logger.error("Expo getPushNotificationReceiptsAsync chunk failed:", err);
      }
    }
    return all;
  },
};
