-- Añade forma de cobro a service_records
ALTER TABLE service_records
  ADD COLUMN payment_method TEXT DEFAULT NULL
  CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta', 'stripe'));
