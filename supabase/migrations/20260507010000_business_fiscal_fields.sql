-- Sprint 9: datos fiscales de la empresa para PDFs de facturas y nóminas
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS nif     text,
  ADD COLUMN IF NOT EXISTS ccc     text,
  ADD COLUMN IF NOT EXISTS tagline text;
