-- Antelación mínima para solicitar vacaciones (días naturales)
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS min_vacation_notice_days smallint NOT NULL DEFAULT 30;
