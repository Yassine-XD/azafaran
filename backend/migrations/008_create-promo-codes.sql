CREATE TYPE promo_type AS ENUM ('percent', 'fixed', 'free_delivery');

CREATE TABLE promo_codes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              VARCHAR(50) NOT NULL UNIQUE,
  type              promo_type NOT NULL,
  value             NUMERIC(10,2),
  min_order_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses          INTEGER,
  used_count        INTEGER NOT NULL DEFAULT 0,
  max_uses_per_user SMALLINT NOT NULL DEFAULT 1,
  expires_at        TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code      ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);

INSERT INTO promo_codes (code, type, value, min_order_amount, max_uses_per_user)
VALUES ('BIENVENIDO', 'percent', 10, 20, 1);
