-- Reemplaza 'tarjeta' por 'bizum' en el CHECK constraint de payment_method
ALTER TABLE service_records
  DROP CONSTRAINT IF EXISTS service_records_payment_method_check;

ALTER TABLE service_records
  ADD CONSTRAINT service_records_payment_method_check
  CHECK (payment_method IN ('efectivo', 'transferencia', 'bizum', 'stripe'));
