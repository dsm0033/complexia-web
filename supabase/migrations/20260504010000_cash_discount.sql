ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS cash_payment_discount SMALLINT
    CHECK (cash_payment_discount IS NULL OR (cash_payment_discount >= 0 AND cash_payment_discount <= 100));
