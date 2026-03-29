CREATE TYPE promotion_type  AS ENUM ('deal', 'flash', 'seasonal', 'bundle');
CREATE TYPE promotion_scope AS ENUM ('product', 'category', 'cart', 'all');
CREATE TYPE discount_type   AS ENUM ('percent', 'fixed', 'free_delivery');

CREATE TABLE promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(200) NOT NULL,
  subtitle        VARCHAR(300),
  type            promotion_type NOT NULL DEFAULT 'deal',
  scope           promotion_scope NOT NULL DEFAULT 'all',
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  discount_type   discount_type,
  discount_value  NUMERIC(10,2),
  image_url       VARCHAR(500),
  badge_text      VARCHAR(50),
  show_on_home    BOOLEAN NOT NULL DEFAULT FALSE,
  show_on_product BOOLEAN NOT NULL DEFAULT FALSE,
  priority        SMALLINT NOT NULL DEFAULT 0,
  starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promotions_is_active    ON promotions(is_active);
CREATE INDEX idx_promotions_show_on_home ON promotions(show_on_home);
CREATE INDEX idx_promotions_product_id   ON promotions(product_id);
CREATE INDEX idx_promotions_category_id  ON promotions(category_id);
