import { pool } from "../config/database";
import { notificationRepository } from "../repositories/notification.repository";
import { logger } from "../utils/logger";

/**
 * Hourly job: Fire scheduled notification campaigns that are due.
 */
export async function processScheduledCampaigns() {
  try {
    // Find campaigns that are due
    const { rows: campaigns } = await pool.query(
      `SELECT * FROM notification_campaigns
       WHERE status = 'draft'
         AND scheduled_at <= NOW()
       ORDER BY scheduled_at ASC
       LIMIT 10`,
    );

    if (campaigns.length === 0) return;

    logger.info(`Campaign scheduler: ${campaigns.length} campaigns to process`);

    for (const campaign of campaigns) {
      try {
        // Determine target users
        let userIds: string[] = [];

        if (campaign.target === "all") {
          const { rows } = await pool.query(
            `SELECT DISTINCT pt.user_id
             FROM push_tokens pt
             JOIN notification_preferences np ON np.user_id = pt.user_id
             WHERE pt.is_active = true AND np.promotions = true`,
          );
          userIds = rows.map((r) => r.user_id);
        } else if (
          campaign.target === "user" &&
          campaign.target_user_ids
        ) {
          userIds = campaign.target_user_ids;
        }

        // Send notification to each user
        let totalSent = 0;
        for (const userId of userIds) {
          try {
            await notificationRepository.createLog({
              userId,
              campaignId: campaign.id,
              eventType: "campaign",
              title: campaign.title,
              body: campaign.body,
              notifData: {
                campaignId: campaign.id,
                deepLink: campaign.deep_link,
              },
            });
            // TODO: actual Expo push when SDK is installed
            totalSent++;
          } catch (err) {
            logger.error(
              `Campaign ${campaign.id}: failed to notify user ${userId}`,
            );
          }
        }

        // Update campaign status
        await pool.query(
          `UPDATE notification_campaigns
           SET status = 'sent', sent_at = NOW(), total_sent = $1
           WHERE id = $2`,
          [totalSent, campaign.id],
        );

        logger.info(
          `Campaign ${campaign.id} sent to ${totalSent} users`,
        );
      } catch (err) {
        await pool.query(
          "UPDATE notification_campaigns SET status = 'failed' WHERE id = $1",
          [campaign.id],
        );
        logger.error(`Campaign ${campaign.id} failed:`, err);
      }
    }
  } catch (err) {
    logger.error("Campaign scheduler job failed:", err);
  }
}
