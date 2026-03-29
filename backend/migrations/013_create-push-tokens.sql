CREATE TYPE device_platform AS ENUM ('ios', 'android');

CREATE TABLE push_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(500) NOT NULL UNIQUE,
  platform   device_platform NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  order_updates     BOOLEAN NOT NULL DEFAULT TRUE,
  reorder_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  promotions        BOOLEAN NOT NULL DEFAULT FALSE,
  ai_suggestions    BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user_id   ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_is_active ON push_tokens(is_active);
