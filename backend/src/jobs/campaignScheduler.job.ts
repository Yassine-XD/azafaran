import { pool } from "../config/database";
import { adminRepository } from "../repositories/admin.repository";
import {
  notificationService,
  NotificationPayload,
} from "../services/notification.service";
import { emailService } from "../services/email.service";
import { logger } from "../utils/logger";

/**
 * Hourly job: Fire scheduled notification campaigns that are due.
 */
export async function processScheduledCampaigns() {
  try {
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
        let userIds: string[] = [];

        if (campaign.target === "all") {
          const { rows } = await pool.query(
            `SELECT DISTINCT u.id AS user_id
             FROM users u
             LEFT JOIN push_tokens pt ON pt.user_id = u.id AND pt.is_active = true
             LEFT JOIN notification_preferences np ON np.user_id = u.id
             WHERE u.is_active = true
               AND (pt.id IS NOT NULL OR COALESCE(np.email_notifications, true) = true)
               AND COALESCE(np.promotions, false) = true`,
          );
          userIds = rows.map((r) => r.user_id);
        } else if (
          campaign.target === "user" &&
          campaign.target_user_ids
        ) {
          userIds = campaign.target_user_ids;
        }

        // Build the canonical payload. campaign.payload (JSONB) is the
        // structured destination; fall back to a generic "campaign" type.
        const stored = (campaign.payload || {}) as Partial<NotificationPayload>;
        const payload: NotificationPayload = {
          v: 1,
          type: stored.type || "campaign",
          ...stored,
          campaignId: campaign.id,
        };

        const result = await notificationService.sendCustomNotification({
          userIds,
          title: campaign.title,
          body: campaign.body,
          payload,
          campaignId: campaign.id,
          imageUrl: campaign.image_url,
          eventType: "campaign",
        });

        // Fire-and-forget campaign emails (does not block push).
        for (const userId of userIds) {
          emailService
            .sendCampaignEmail(userId, {
              title: campaign.title,
              body: campaign.body,
              image_url: campaign.image_url,
              deep_link: campaign.deep_link,
            })
            .catch((err) =>
              logger.error(
                `Campaign ${campaign.id}: email failed for user ${userId}: ${err.message}`,
              ),
            );
        }

        await adminRepository.updateCampaignStatus(
          campaign.id,
          "sent",
          result.sent + result.logged,
        );
        logger.info(
          `Campaign ${campaign.id}: pushed=${result.sent} failed=${result.failed} logged-only=${result.logged}`,
        );
      } catch (err) {
        await adminRepository
          .updateCampaignStatus(campaign.id, "failed")
          .catch(() => {});
        logger.error(`Campaign ${campaign.id} failed:`, err);
      }
    }
  } catch (err) {
    logger.error("Campaign scheduler job failed:", err);
  }
}
