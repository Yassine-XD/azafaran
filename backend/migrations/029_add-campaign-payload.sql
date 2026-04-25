-- Add structured payload column to notification campaigns.
-- This is the canonical deep-link contract sent to devices in `data`:
-- { v: 1, type: "screen"|"product"|"coupon"|"order"|"campaign"|"none", ... }
-- The legacy `deep_link` text column is kept for admin display only.

ALTER TABLE notification_campaigns
  ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb;
