-- ============================================================
-- AZAFARAN SEED DATA
-- Real products from Carnes Alhambra (carnesalhambra.es)
-- Run after migrations: psql $DATABASE_URL -f seed.sql
-- ============================================================

-- ─── Admin User ─────────────────────────────────────
-- password: Admin123! (bcrypt hash)
INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role, is_verified)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Yassine', 'Admin',
  'admin@azafaran.es',
  '$2a$12$LJ3a5eH8wB7rZ9k0pY4KeO3h8xP8xY9z3J5sKdF7gR4tQ6vW8mN2e',
  '+34600000000',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- ─── Categories (6) ─────────────────────────────────
INSERT INTO categories (id, name, slug, description, image_url, display_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Ternera',    'ternera',    'Cortes selectos de ternera halal',                  '/images/categories/ternera.jpg',    1),
  ('c1000000-0000-0000-0000-000000000002', 'Cordero',    'cordero',    'Cordero halal de primera calidad',                  '/images/categories/cordero.jpg',    2),
  ('c1000000-0000-0000-0000-000000000003', 'Pollo',      'pollo',      'Pollo fresco halal certificado',                    '/images/categories/pollo.jpg',      3),
  ('c1000000-0000-0000-0000-000000000004', 'Conejo',     'conejo',     'Conejo fresco halal',                               '/images/categories/conejo.jpg',     4),
  ('c1000000-0000-0000-0000-000000000005', 'Elaborados', 'elaborados', 'Productos elaborados: hamburguesas, albóndigas, etc', '/images/categories/elaborados.jpg', 5),
  ('c1000000-0000-0000-0000-000000000006', 'BBQ Packs',  'bbq-packs',  'Packs especiales para barbacoa',                    '/images/categories/bbq.jpg',        6)
ON CONFLICT DO NOTHING;

-- ─── Products (18) ──────────────────────────────────
-- Ternera (4 products)
INSERT INTO products (id, category_id, name, slug, description, short_desc, price_per_kg, unit_type, halal_cert_id, halal_cert_body, images, tags, is_featured, sort_order) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Solomillo de Ternera', 'solomillo-ternera', 'Solomillo de ternera halal, el corte más tierno y jugoso. Ideal para plancha o horno.', 'El corte más tierno', 32.90, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['premium', 'plancha'], true, 1),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Entrecot de Ternera',  'entrecot-ternera',  'Entrecot de ternera halal, marmoleado perfecto para parrilla.', 'Marmoleado perfecto', 24.90, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['parrilla', 'popular'], true, 2),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Carne Picada de Ternera', 'carne-picada-ternera', 'Carne picada de ternera halal, ideal para hamburguesas, albóndigas y boloñesa.', 'Para todo tipo de recetas', 12.90, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['versátil', 'económico'], false, 3),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Falda de Ternera',     'falda-ternera',     'Falda de ternera halal, perfecta para guisos y estofados lentos.', 'Ideal para guisos', 14.50, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['guisos', 'cocción lenta'], false, 4),

-- Cordero (3 products)
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'Pierna de Cordero',    'pierna-cordero',    'Pierna de cordero halal entera, ideal para asar en horno.', 'Para asar entero', 18.90, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['horno', 'celebración'], true, 1),
  ('p1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'Chuletas de Cordero',  'chuletas-cordero',  'Chuletas de cordero halal, cortadas a mano para parrilla.', 'Cortadas a mano', 22.90, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['parrilla', 'premium'], true, 2),
  ('p1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'Costillar de Cordero', 'costillar-cordero', 'Costillar de cordero halal, perfecto para barbacoa.', 'Perfecto para BBQ', 16.90, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['bbq', 'parrilla'], false, 3),

-- Pollo (4 products)
  ('p1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003', 'Pollo Entero',         'pollo-entero',         'Pollo entero halal fresco, criado en libertad.', 'Criado en libertad', 6.90, 'kg', 'HAL-ES-002', 'Halal Food Authority', '[]', ARRAY['entero', 'fresco'], false, 1),
  ('p1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000003', 'Pechuga de Pollo',     'pechuga-pollo',        'Pechuga de pollo halal sin hueso ni piel, alta en proteínas.', 'Alta en proteínas', 9.90, 'kg', 'HAL-ES-002', 'Halal Food Authority', '[]', ARRAY['fitness', 'saludable'], true, 2),
  ('p1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000003', 'Muslos de Pollo',      'muslos-pollo',         'Muslos de pollo halal, jugosos y con sabor intenso.', 'Jugosos y sabrosos', 7.50, 'kg', 'HAL-ES-002', 'Halal Food Authority', '[]', ARRAY['guisos', 'económico'], false, 3),
  ('p1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000003', 'Alitas de Pollo',      'alitas-pollo',         'Alitas de pollo halal, ideales para freidora de aire o horno.', 'Para freidora de aire', 5.90, 'kg', 'HAL-ES-002', 'Halal Food Authority', '[]', ARRAY['snack', 'bbq'], false, 4),

-- Conejo (2 products)
  ('p1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000004', 'Conejo Entero',        'conejo-entero',        'Conejo entero halal, carne magra y tierna.', 'Carne magra', 11.90, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['entero', 'saludable'], false, 1),
  ('p1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000004', 'Conejo Troceado',      'conejo-troceado',      'Conejo troceado halal, listo para guisar con arroz o paella.', 'Listo para guisar', 13.50, 'kg', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['guisos', 'paella'], false, 2),

-- Elaborados (3 products)
  ('p1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000005', 'Hamburguesas de Ternera', 'hamburguesas-ternera', '4 hamburguesas artesanales de ternera halal, 150g cada una.', '4 uds artesanales', 9.90, 'pack', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['pack', 'fácil'], true, 1),
  ('p1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000005', 'Albóndigas Caseras',     'albondigas-caseras',   'Bandeja de albóndigas caseras de ternera y cordero halal.', 'Ternera y cordero', 8.50, 'pack', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['pack', 'casero'], false, 2),
  ('p1000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000005', 'Kefta Marroquí',         'kefta-marroqui',       'Brochetas de kefta marroquí halal con especias tradicionales.', 'Receta tradicional', 11.90, 'pack', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['especias', 'brocheta'], true, 3),

-- BBQ Packs (2 products)
  ('p1000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000006', 'Pack BBQ Familiar',    'pack-bbq-familiar',    'Pack barbacoa para 4-6 personas: chuletas de cordero, entrecot, alitas y hamburguesas.', 'Para 4-6 personas', 49.90, 'pack', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['pack', 'bbq', 'familia'], true, 1),
  ('p1000000-0000-0000-0000-000000000018', 'c1000000-0000-0000-0000-000000000006', 'Pack BBQ Premium',     'pack-bbq-premium',     'Pack premium para 6-8 personas: solomillo, chuletón, costillar y kefta.', 'Para 6-8 personas', 79.90, 'pack', 'HAL-ES-001', 'Instituto Halal de Junta Islámica', '[]', ARRAY['pack', 'bbq', 'premium'], true, 2)
ON CONFLICT DO NOTHING;

-- ─── Product Variants (36) ──────────────────────────
-- Each product gets 2 weight variants

-- Solomillo de Ternera
INSERT INTO product_variants (id, product_id, label, weight_grams, price, stock_qty, sku, sort_order) VALUES
  ('v1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', '500g',  500,  16.45, 25, 'TRN-SOL-500', 1),
  ('v1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', '1kg',   1000, 32.90, 15, 'TRN-SOL-1000', 2),
-- Entrecot
  ('v1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000002', '400g',  400,  9.96,  30, 'TRN-ENT-400', 1),
  ('v1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000002', '800g',  800,  19.92, 20, 'TRN-ENT-800', 2),
-- Carne Picada
  ('v1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000003', '500g',  500,  6.45,  50, 'TRN-PIC-500', 1),
  ('v1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000003', '1kg',   1000, 12.90, 40, 'TRN-PIC-1000', 2),
-- Falda
  ('v1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000004', '500g',  500,  7.25,  30, 'TRN-FAL-500', 1),
  ('v1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000004', '1kg',   1000, 14.50, 20, 'TRN-FAL-1000', 2),
-- Pierna de Cordero
  ('v1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000005', '1kg',   1000, 18.90, 15, 'COR-PIE-1000', 1),
  ('v1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000005', '2kg',   2000, 37.80, 10, 'COR-PIE-2000', 2),
-- Chuletas de Cordero
  ('v1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000006', '500g',  500,  11.45, 25, 'COR-CHU-500', 1),
  ('v1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000006', '1kg',   1000, 22.90, 15, 'COR-CHU-1000', 2),
-- Costillar de Cordero
  ('v1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000007', '600g',  600,  10.14, 20, 'COR-COS-600', 1),
  ('v1000000-0000-0000-0000-000000000014', 'p1000000-0000-0000-0000-000000000007', '1.2kg', 1200, 20.28, 12, 'COR-COS-1200', 2),
-- Pollo Entero
  ('v1000000-0000-0000-0000-000000000015', 'p1000000-0000-0000-0000-000000000008', '1.5kg', 1500, 10.35, 30, 'POL-ENT-1500', 1),
  ('v1000000-0000-0000-0000-000000000016', 'p1000000-0000-0000-0000-000000000008', '2kg',   2000, 13.80, 20, 'POL-ENT-2000', 2),
-- Pechuga de Pollo
  ('v1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000009', '500g',  500,  4.95,  40, 'POL-PEC-500', 1),
  ('v1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000009', '1kg',   1000, 9.90,  30, 'POL-PEC-1000', 2),
-- Muslos de Pollo
  ('v1000000-0000-0000-0000-000000000019', 'p1000000-0000-0000-0000-000000000010', '500g',  500,  3.75,  35, 'POL-MUS-500', 1),
  ('v1000000-0000-0000-0000-000000000020', 'p1000000-0000-0000-0000-000000000010', '1kg',   1000, 7.50,  25, 'POL-MUS-1000', 2),
-- Alitas de Pollo
  ('v1000000-0000-0000-0000-000000000021', 'p1000000-0000-0000-0000-000000000011', '500g',  500,  2.95,  40, 'POL-ALI-500', 1),
  ('v1000000-0000-0000-0000-000000000022', 'p1000000-0000-0000-0000-000000000011', '1kg',   1000, 5.90,  30, 'POL-ALI-1000', 2),
-- Conejo Entero
  ('v1000000-0000-0000-0000-000000000023', 'p1000000-0000-0000-0000-000000000012', '1.2kg', 1200, 14.28, 15, 'CON-ENT-1200', 1),
  ('v1000000-0000-0000-0000-000000000024', 'p1000000-0000-0000-0000-000000000012', '1.8kg', 1800, 21.42, 10, 'CON-ENT-1800', 2),
-- Conejo Troceado
  ('v1000000-0000-0000-0000-000000000025', 'p1000000-0000-0000-0000-000000000013', '500g',  500,  6.75,  20, 'CON-TRO-500', 1),
  ('v1000000-0000-0000-0000-000000000026', 'p1000000-0000-0000-0000-000000000013', '1kg',   1000, 13.50, 15, 'CON-TRO-1000', 2),
-- Hamburguesas (pack)
  ('v1000000-0000-0000-0000-000000000027', 'p1000000-0000-0000-0000-000000000014', '4 uds (600g)', 600, 9.90, 35, 'ELA-HAM-4', 1),
  ('v1000000-0000-0000-0000-000000000028', 'p1000000-0000-0000-0000-000000000014', '8 uds (1.2kg)', 1200, 18.50, 20, 'ELA-HAM-8', 2),
-- Albóndigas
  ('v1000000-0000-0000-0000-000000000029', 'p1000000-0000-0000-0000-000000000015', 'Bandeja 500g', 500, 8.50, 25, 'ELA-ALB-500', 1),
  ('v1000000-0000-0000-0000-000000000030', 'p1000000-0000-0000-0000-000000000015', 'Bandeja 1kg',  1000, 15.90, 15, 'ELA-ALB-1000', 2),
-- Kefta
  ('v1000000-0000-0000-0000-000000000031', 'p1000000-0000-0000-0000-000000000016', '6 brochetas (500g)', 500, 11.90, 25, 'ELA-KEF-6', 1),
  ('v1000000-0000-0000-0000-000000000032', 'p1000000-0000-0000-0000-000000000016', '12 brochetas (1kg)', 1000, 21.90, 15, 'ELA-KEF-12', 2),
-- Pack BBQ Familiar
  ('v1000000-0000-0000-0000-000000000033', 'p1000000-0000-0000-0000-000000000017', 'Pack 4-6 personas (3kg)',  3000, 49.90, 10, 'BBQ-FAM-3000', 1),
  ('v1000000-0000-0000-0000-000000000034', 'p1000000-0000-0000-0000-000000000017', 'Pack 6-8 personas (4.5kg)', 4500, 69.90, 8, 'BBQ-FAM-4500', 2),
-- Pack BBQ Premium
  ('v1000000-0000-0000-0000-000000000035', 'p1000000-0000-0000-0000-000000000018', 'Pack 6-8 personas (4kg)',  4000, 79.90, 8, 'BBQ-PRE-4000', 1),
  ('v1000000-0000-0000-0000-000000000036', 'p1000000-0000-0000-0000-000000000018', 'Pack 8-10 personas (6kg)', 6000, 109.90, 5, 'BBQ-PRE-6000', 2)
ON CONFLICT DO NOTHING;

-- ─── Pack Items ─────────────────────────────────────
-- Links pack products to their contained individual products
INSERT INTO pack_items (id, pack_id, product_id, quantity, custom_label, sort_order) VALUES
-- Pack BBQ Familiar: chuletas de cordero, entrecot, alitas, hamburguesas
  ('pi100000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000006', 1, 'Chuletas de cordero', 1),
  ('pi100000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000002', 1, 'Entrecot de ternera', 2),
  ('pi100000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000011', 1, 'Alitas de pollo', 3),
  ('pi100000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000014', 1, 'Hamburguesas de ternera', 4),
-- Pack BBQ Premium: solomillo, entrecot, costillar, kefta
  ('pi100000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000001', 1, 'Solomillo de ternera', 1),
  ('pi100000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000002', 1, 'Entrecot de ternera', 2),
  ('pi100000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000007', 1, 'Costillar de cordero', 3),
  ('pi100000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000016', 1, 'Kefta marroquí', 4)
ON CONFLICT DO NOTHING;

-- ─── Banners (3) ────────────────────────────────────
INSERT INTO banners (id, title, subtitle, image_url, cta_text, cta_link, display_order) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Carne Halal Certificada', 'Frescura y calidad garantizada cada día', '/images/banners/halal-hero.jpg', 'Ver Productos', '/products', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Pack BBQ de Verano', 'Todo lo que necesitas para tu barbacoa', '/images/banners/bbq-summer.jpg', 'Ver Packs', '/categories/bbq-packs', 2),
  ('b1000000-0000-0000-0000-000000000003', 'Envío Gratis +40€', 'Entrega a domicilio en Barcelona', '/images/banners/free-delivery.jpg', 'Comprar Ahora', '/products', 3)
ON CONFLICT DO NOTHING;

-- ─── Promotions (2) ─────────────────────────────────
INSERT INTO promotions (id, title, subtitle, type, scope, discount_type, discount_value, badge_text, show_on_home, priority, starts_at) VALUES
  ('pr100000-0000-0000-0000-000000000001', 'Oferta de Bienvenida', 'Usa el código BIENVENIDO para un 10% de descuento en tu primer pedido', 'deal', 'cart', 'percent', 10, '-10%', true, 10, NOW()),
  ('pr100000-0000-0000-0000-000000000002', 'Pack BBQ -15%', 'Descuento especial en todos los packs de barbacoa', 'seasonal', 'category', 'percent', 15, '-15%', true, 5, NOW())
ON CONFLICT DO NOTHING;

-- Link BBQ promotion to BBQ category
UPDATE promotions
SET category_id = 'c1000000-0000-0000-0000-000000000006'
WHERE id = 'pr100000-0000-0000-0000-000000000002';

-- ─── Delivery Slots (next 7 days, 3 slots/day) ──────
DO $$
DECLARE
  d DATE;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + 6, '1 day'::interval)::date
  LOOP
    INSERT INTO delivery_slots (id, date, start_time, end_time, max_orders)
    VALUES
      (gen_random_uuid(), d, '09:00', '12:00', 10),
      (gen_random_uuid(), d, '12:00', '15:00', 10),
      (gen_random_uuid(), d, '17:00', '20:00', 10)
    ON CONFLICT (date, start_time) DO NOTHING;
  END LOOP;
END $$;

-- ─── Promo Code (already created in migration 008, but ensure exists)
INSERT INTO promo_codes (id, code, type, value, min_order_amount, max_uses_per_user)
VALUES (gen_random_uuid(), 'BIENVENIDO', 'percent', 10, 20, 1)
ON CONFLICT (code) DO NOTHING;
