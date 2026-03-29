CREATE TYPE unit_type AS ENUM ('kg', 'unit', 'pack');

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  short_desc      VARCHAR(300),
  price_per_kg    NUMERIC(10,2) NOT NULL,
  unit_type       unit_type NOT NULL DEFAULT 'kg',
  halal_cert_id   VARCHAR(50),
  halal_cert_body VARCHAR(100) DEFAULT 'CICEM',
  images          JSONB NOT NULL DEFAULT '[]',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_is_active   ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_tags        ON products USING gin(tags);
CREATE INDEX idx_products_fts         ON products
  USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));
