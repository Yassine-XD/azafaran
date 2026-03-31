import { pool } from "../config/database";
import { notificationService } from "../services/notification.service";
import { logger } from "../utils/logger";

/**
 * Daily job: Remind users who haven't ordered in a while.
 * Finds users whose average reorder interval is close (80%) to being exceeded.
 */
export async function sendReorderReminders() {
  try {
    // Find users with at least 2 delivered orders who haven't ordered recently
    const { rows: candidates } = await pool.query(
      `WITH user_intervals AS (
         SELECT
           user_id,
           AVG(interval_days) AS avg_interval,
           MAX(created_at) AS last_order_at
         FROM (
           SELECT
             user_id,
             created_at,
             EXTRACT(DAY FROM created_at - LAG(created_at) OVER (
               PARTITION BY user_id ORDER BY created_at
             )) AS interval_days
           FROM orders
           WHERE status = 'delivered'
         ) sub
         WHERE interval_days IS NOT NULL
         GROUP BY user_id
         HAVING COUNT(*) >= 1
       )
       SELECT user_id, avg_interval, last_order_at
       FROM user_intervals
       WHERE EXTRACT(DAY FROM NOW() - last_order_at) >= avg_interval * 0.8`,
    );

    logger.info(
      `Reorder reminder: ${candidates.length} candidates found`,
    );

    for (const candidate of candidates) {
      await notificationService
        .sendOrderNotification(
          candidate.user_id,
          "reorder_reminder",
          "",
        )
        .catch((err) =>
          logger.error(
            `Failed to send reorder reminder to ${candidate.user_id}: ${err.message}`,
          ),
        );
    }
  } catch (err) {
    logger.error("Reorder reminder job failed:", err);
  }
}
