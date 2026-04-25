import { ExpoPushReceiptId } from "expo-server-sdk";
import { notificationRepository } from "../repositories/notification.repository";
import { expoPush } from "../services/expoPush.service";
import { logger } from "../utils/logger";

/**
 * Periodic job: Check Expo push notification delivery receipts.
 * Verifies that sent notifications were actually delivered, marks failures,
 * and deactivates tokens that Expo reports as DeviceNotRegistered.
 */
export async function checkPushReceipts() {
  try {
    const pending = await notificationRepository.findPendingReceipts(100);
    if (pending.length === 0) return;

    logger.info(`Receipt checker: ${pending.length} receipts to verify`);

    const ids = pending
      .map((p) => p.expo_receipt_id)
      .filter((id): id is string => Boolean(id)) as ExpoPushReceiptId[];

    const receipts = await expoPush.getReceipts(ids);

    for (const row of pending) {
      const receipt = receipts[row.expo_receipt_id];
      if (!receipt) continue; // Expo doesn't have it yet — try again next run.

      if (receipt.status === "ok") {
        await notificationRepository.updateLogStatus(row.id, "delivered");
        continue;
      }

      const detailsErr = (receipt.details as { error?: string } | undefined)
        ?.error;
      await notificationRepository.updateLogStatus(
        row.id,
        "failed",
        receipt.message || detailsErr || "Expo receipt error",
      );
      if (detailsErr === "DeviceNotRegistered" && row.push_token) {
        await notificationRepository.deactivateByToken(row.push_token);
      }
    }
  } catch (err) {
    logger.error("Receipt checker job failed:", err);
  }
}
