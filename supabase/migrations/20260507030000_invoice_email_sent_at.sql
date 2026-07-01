-- Registra cuándo se envió la factura por email al cliente
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;
