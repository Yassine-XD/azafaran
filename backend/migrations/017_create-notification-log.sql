CREATE TYPE notification_event AS ENUM (
  'order_confirmed', 'order_preparing', 'order_shipped',
  'order_delivered', 'order_cancelled', 'reorder_reminder',
  'cart_abandoned', 'campaign', 'flash_deal'
);

CREATE TYPE notification_status AS ENUM (
  'sent', 'delivered', 'failed', 'opened'
);

CREATE TABLE notification_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  push_token_id   UUID REFERENCES push_tokens(id) ON DELETE SET NULL,
  campaign_id     UUID REFERENCES notification_campaigns(id) ON DELETE SET NULL,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  event_type      notification_event NOT NULL,
  title           VARCHAR(200) NOT NULL,
  body            TEXT NOT NULL,
  data            JSONB NOT NULL DEFAULT '{}',
  status          notification_status NOT NULL DEFAULT 'sent',
  expo_receipt_id VARCHAR(200),
  opened_at       TIMESTAMPTZ,
  error_message   TEXT,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_log_user_id     ON notification_log(user_id);
CREATE INDEX idx_notif_log_campaign_id ON notification_log(campaign_id);
CREATE INDEX idx_notif_log_order_id    ON notification_log(order_id);
CREATE INDEX idx_notif_log_sent_at     ON notification_log(sent_at DESC);
CREATE INDEX idx_notif_log_status      ON notification_log(status);
