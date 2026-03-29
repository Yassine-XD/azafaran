CREATE TYPE campaign_type   AS ENUM ('campaign', 'reorder', 'flash');
CREATE TYPE campaign_target AS ENUM ('all', 'segment', 'user');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sent', 'failed');

CREATE TABLE notification_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(200) NOT NULL,
  body            TEXT NOT NULL,
  type            campaign_type NOT NULL DEFAULT 'campaign',
  target          campaign_target NOT NULL DEFAULT 'all',
  target_user_ids UUID[],
  target_segment  JSONB,
  deep_link       VARCHAR(200),
  promotion_id    UUID REFERENCES promotions(id) ON DELETE SET NULL,
  image_url       VARCHAR(500),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  status          campaign_status NOT NULL DEFAULT 'draft',
  total_sent      INTEGER NOT NULL DEFAULT 0,
  total_opened    INTEGER NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status       ON notification_campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON notification_campaigns(scheduled_at);
