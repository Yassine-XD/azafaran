CREATE TABLE banners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(200) NOT NULL,
  subtitle      VARCHAR(300),
  image_url     VARCHAR(500) NOT NULL,
  cta_text      VARCHAR(50),
  cta_link      VARCHAR(200),
  display_order SMALLINT NOT NULL DEFAULT 0,
  starts_at     TIMESTAMPTZ,
  ends_at       TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_is_active ON banners(is_active);
CREATE INDEX idx_banners_order     ON banners(display_order);
