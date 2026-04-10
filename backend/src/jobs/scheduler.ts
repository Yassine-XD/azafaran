import cron from "node-cron";
import { logger } from "../utils/logger";
import { cleanExpiredCarts } from "./cartExpiry.job";
import { sendReorderReminders } from "./reorderReminder.job";
import { processScheduledCampaigns } from "./campaignScheduler.job";
import { checkPushReceipts } from "./receiptChecker.job";
import { sendReviewReminders } from "./reviewReminder.job";

/**
 * Initialize all cron jobs.
 * Call this from server.ts after DB connection is established.
 */
export function startScheduler() {
  logger.info("Starting cron job scheduler...");

  // Every day at 3:00 AM — clean expired carts
  cron.schedule("0 3 * * *", async () => {
    logger.info("Running: cart expiry cleanup");
    await cleanExpiredCarts();
  });

  // Every day at 10:00 AM — send reorder reminders
  cron.schedule("0 10 * * *", async () => {
    logger.info("Running: reorder reminders");
    await sendReorderReminders();
  });

  // Every hour at :00 — process scheduled campaigns
  cron.schedule("0 * * * *", async () => {
    logger.info("Running: campaign scheduler");
    await processScheduledCampaigns();
  });

  // Every 30 minutes — check push receipt delivery
  cron.schedule("*/30 * * * *", async () => {
    logger.info("Running: push receipt checker");
    await checkPushReceipts();
  });

  // Every day at 11:00 AM — send review request emails (48h after delivery)
  cron.schedule("0 11 * * *", async () => {
    logger.info("Running: review reminder emails");
    await sendReviewReminders();
  });

  logger.info("Cron jobs scheduled successfully");
}
