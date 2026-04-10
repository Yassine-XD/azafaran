import { pool } from "../config/database";
import { emailService } from "../services/email.service";
import { notificationRepository } from "../repositories/notification.repository";
import { logger } from "../utils/logger";

/**
 * Daily job: Send review request emails to users whose orders
 * were delivered 48+ hours ago and haven't been reviewed yet.
 */
export async function sendReviewReminders() {
  try {
    const { rows: candidates } = await pool.query(
      `SELECT o.id AS order_id, o.order_number, o.user_id
       FROM orders o
       LEFT JOIN reviews r ON r.order_id = o.id
       LEFT JOIN notification_log nl
         ON nl.order_id = o.id AND nl.event_type = 'review_request'
       WHERE o.status = 'delivered'
         AND o.updated_at <= NOW() - INTERVAL '48 hours'
         AND r.id IS NULL
         AND nl.id IS NULL`,
    );

    logger.info(
      `Review reminder: ${candidates.length} candidates found`,
    );

    for (const candidate of candidates) {
      try {
        await emailService.sendReviewRequest(candidate.order_id);

        // Log so we don't send again
        await notificationRepository.createLog({
          userId: candidate.user_id,
          orderId: candidate.order_id,
          eventType: "review_request",
          title: "Solicitud de valoración",
          body: `Valorar pedido ${candidate.order_number}`,
        });
      } catch (err) {
        logger.error(
          `Failed to send review reminder for order ${candidate.order_id}: ${(err as Error).message}`,
        );
      }
    }
  } catch (err) {
    logger.error("Review reminder job failed:", err);
  }
}
