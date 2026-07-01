-- F9-05a: Columna slug en businesses — routing multi-tenant
--
-- El slug identifica al tenant en las URLs: /app/[slug]/...
-- laimpecable.es sigue funcionando vía rewrite de hostname en proxy.js
-- que redirige internamente a /app/la-impecable/...
--
-- Orden: nullable primero → UPDATE → NOT NULL → UNIQUE (evita error
-- si ya existe algún registro sin slug al ejecutar la migración).

-- 1. Añadir columna como nullable
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS slug text;

COMMENT ON COLUMN public.businesses.slug
  IS 'Identificador URL del tenant: /app/[slug]/. Inmutable tras creación.';

-- 2. Asignar slug al negocio existente (La Impecable)
UPDATE public.businesses
  SET slug = 'la-impecable'
  WHERE slug IS NULL;

-- 3. Forzar NOT NULL + UNIQUE
ALTER TABLE public.businesses
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_slug_unique UNIQUE (slug);

-- 4. Índice para resolución rápida por slug en cada request
CREATE INDEX IF NOT EXISTS idx_businesses_slug
  ON public.businesses (slug);

-- 5. Policy: resolución pública de tenant (páginas /app/[slug]/servicios,
--    /app/[slug]/reservar, etc. no requieren autenticación)
--    MVP: expone columnas básicas del negocio activo.
--    TODO antes de múltiples tenants en prod: crear vista pública con solo
--    (id, name, slug) y revocar SELECT directo en businesses para anon.
CREATE POLICY "público resuelve tenant activo"
  ON public.businesses FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- 6. Tenant de prueba para validar el slice vertical (slug, auth/callback
--    multi-tenant, proxy.js hostname rewrite) sin tocar datos reales.
--    Eliminar cuando el slice esté validado.
INSERT INTO public.businesses (name, slug, plan, active, trial_ends_at)
VALUES (
  'Taller Demo',
  'taller-demo',
  'free',
  true,
  now() + interval '30 days'
)
ON CONFLICT (slug) DO NOTHING;
