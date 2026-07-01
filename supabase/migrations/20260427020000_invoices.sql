-- Tabla de facturas
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_record_id UUID REFERENCES service_records(id) ON DELETE SET NULL,
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  invoice_number  TEXT NOT NULL UNIQUE,   -- IMP-2026-0001
  invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  service_name    TEXT NOT NULL,
  total_amount    NUMERIC(10,2) NOT NULL,
  base_amount     NUMERIC(10,2) NOT NULL, -- total / 1.21
  iva_amount      NUMERIC(10,2) NOT NULL, -- total - base
  customer_name   TEXT,
  customer_email  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Secuencia para numeración de facturas
CREATE SEQUENCE invoice_number_seq START 1;

-- Función pública para obtener el siguiente número (llamada desde API con service role)
CREATE OR REPLACE FUNCTION nextval_invoice()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT nextval('invoice_number_seq');
$$;

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admin ve todas las facturas de su negocio
CREATE POLICY "admin_invoices" ON invoices
  FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cliente ve solo sus propias facturas
CREATE POLICY "cliente_invoices" ON invoices
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers
      WHERE auth_user_id = auth.uid()
    )
  );
