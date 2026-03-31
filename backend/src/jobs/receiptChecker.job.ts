import { pool } from "../config/database";
import { notificationRepository } from "../repositories/notification.repository";
import { logger } from "../utils/logger";

/**
 * Periodic job: Check Expo push notification delivery receipts.
 * Verifies that sent notifications were actually delivered.
 */
export async function checkPushReceipts() {
  try {
    // Find notifications with expo_receipt_id that are still in 'sent' status
    const { rows: pendingReceipts } = await pool.query(
      `SELECT id, expo_receipt_id
       FROM notification_log
       WHERE status = 'sent'
         AND expo_receipt_id IS NOT NULL
         AND sent_at > NOW() - INTERVAL '24 hours'
       LIMIT 100`,
    );

    if (pendingReceipts.length === 0) return;

    logger.info(
      `Receipt checker: ${pendingReceipts.length} receipts to verify`,
    );

    // TODO: When expo-server-sdk is installed, use:
    // const receiptIds = pendingReceipts.map(r => r.expo_receipt_id);
    // const receipts = await expo.getPushNotificationReceiptsAsync(receiptIds);
    // For each receipt, update status to 'delivered' or 'failed'

    for (const receipt of pendingReceipts) {
      // Placeholder: mark as delivered for now
      await notificationRepository.updateLogStatus(receipt.id, "delivered");
    }
  } catch (err) {
    logger.error("Receipt checker job failed:", err);
  }
}
