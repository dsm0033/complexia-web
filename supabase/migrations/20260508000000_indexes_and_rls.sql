-- ─────────────────────────────────────────────
-- Índices de rendimiento
-- ─────────────────────────────────────────────

-- service_records (tabla más consultada del panel admin)
CREATE INDEX IF NOT EXISTS idx_sr_business_id      ON service_records(business_id);
CREATE INDEX IF NOT EXISTS idx_sr_business_status  ON service_records(business_id, status);
CREATE INDEX IF NOT EXISTS idx_sr_business_employee ON service_records(business_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_sr_customer_id      ON service_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_sr_date             ON service_records(date DESC);

-- bookings
CREATE INDEX IF NOT EXISTS idx_bookings_business_id   ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business_date ON bookings(business_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_status        ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email         ON bookings(customer_email);

-- invoices
CREATE INDEX IF NOT EXISTS idx_invoices_business_id ON invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date        ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);

-- customers
CREATE INDEX IF NOT EXISTS idx_customers_business_id   ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_email_biz     ON customers(email, business_id);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_business_id ON profiles(business_id);

-- employees
CREATE INDEX IF NOT EXISTS idx_employees_business_id ON employees(business_id);

-- services
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);

-- ─────────────────────────────────────────────
-- RLS: restringir INSERT en bookings
-- Antes: WITH CHECK (true) — cualquiera podía insertar cualquier dato
-- Ahora: valida que la fecha sea futura y el precio positivo
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "público puede reservar" ON public.bookings;

CREATE POLICY "público puede reservar"
  ON public.bookings FOR INSERT
  WITH CHECK (
    date >= CURRENT_DATE
    AND price > 0
    AND EXISTS (SELECT 1 FROM businesses WHERE id = business_id)
  );
