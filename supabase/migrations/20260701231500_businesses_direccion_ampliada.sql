-- Dirección ampliada del negocio: código postal, ciudad y provincia.
-- `address` queda para calle y número; las superficies públicas y los
-- PDFs componen la dirección completa con fullAddress() de
-- src/lib/business-contact.js.
--
-- Additiva y segura de aplicar en producción (ADD COLUMN IF NOT EXISTS,
-- sin defaults ni rewrites). Los GRANTs a nivel de tabla existentes
-- cubren las columnas nuevas.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS province text;

COMMENT ON COLUMN public.businesses.postal_code IS 'Código postal del negocio';
COMMENT ON COLUMN public.businesses.city        IS 'Ciudad / municipio del negocio';
COMMENT ON COLUMN public.businesses.province    IS 'Provincia del negocio';
