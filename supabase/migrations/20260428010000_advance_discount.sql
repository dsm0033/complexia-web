-- Descuento por pago adelantado (%) en configuración del negocio
ALTER TABLE business_settings
  ADD COLUMN advance_payment_discount SMALLINT DEFAULT NULL
  CHECK (advance_payment_discount IS NULL OR (advance_payment_discount >= 0 AND advance_payment_discount <= 100));

-- Descuento aplicado en cada reserva (para historial y facturas)
ALTER TABLE bookings
  ADD COLUMN discount_percent SMALLINT DEFAULT NULL,
  ADD COLUMN discount_amount  NUMERIC(10,2) DEFAULT NULL;
