CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  image_url     VARCHAR(500),
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug      ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Ternero',    'ternero',    'Carne de ternera halal certificada',    1),
  ('Cordero',    'cordero',    'Cordero halal de primera calidad',      2),
  ('Pollo',      'pollo',      'Pollo entero y en piezas halal',        3),
  ('Conejo',     'conejo',     'Conejo halal fresco',                   4),
  ('Elaborados', 'elaborados', 'Hamburguesas, salchichas y preparados', 5),
  ('BBQ Pack',   'bbq-pack',   'Packs especiales para barbacoa',        6);
