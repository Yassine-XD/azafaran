import nodemailer from "nodemailer";
import { env } from "./env";
import { logger } from "../utils/logger";

const isConfigured =
  env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS;

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT!, 10),
      secure: parseInt(env.SMTP_PORT!, 10) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

if (!isConfigured) {
  logger.warn("SMTP not configured — email sending disabled");
}

export async function sendMail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!transporter) {
    logger.warn(`Email skipped (SMTP not configured): ${subject} → ${to}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject,
      html,
    });
    logger.info(
      `Email sent: ${subject} → ${to} (messageId=${info.messageId})`,
    );
  } catch (err) {
    logger.error(`Email send failed: ${subject} → ${to}`, err);
    throw err;
  }
}
