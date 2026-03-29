-- UP
-- Auto-generate order numbers like CA-2025-0001

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CA-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
         LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;