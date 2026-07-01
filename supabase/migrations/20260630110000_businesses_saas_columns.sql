-- F9-01 / F9-02: Columnas de plan y feature flags en businesses
-- Añade la capa de plataforma SaaS sobre el modelo multi-tenant existente.
--
-- SECURITY TODO (antes de que F9-13 billing esté activo):
-- plan / active / trial_ends_at / features deben ser de solo escritura
-- por service_role (webhook Stripe + superadmin). Hoy solo Diego es admin
-- así que no es explotable, pero hay que añadir column-level grants cuando
-- se abra el registro a otros tenants:
--   REVOKE UPDATE (plan, active, trial_ends_at, features) ON businesses FROM authenticated;
--   GRANT  UPDATE (plan, active, trial_ends_at, features) ON businesses TO service_role;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS plan           text        NOT NULL DEFAULT 'free'
    CONSTRAINT businesses_plan_check CHECK (plan IN ('free', 'basic', 'pro')),
  ADD COLUMN IF NOT EXISTS active         boolean     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS trial_ends_at  timestamptz          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS features       jsonb       NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.businesses.plan IS 'Plan de suscripción: free | basic | pro';
COMMENT ON COLUMN public.businesses.active IS 'false = tenant suspendido (no puede acceder)';
COMMENT ON COLUMN public.businesses.trial_ends_at IS 'Fin del trial gratuito; NULL = sin trial activo';
COMMENT ON COLUMN public.businesses.features IS 'Feature flags por tenant: {"nominas":true,"ia_ocr":false,...}';
