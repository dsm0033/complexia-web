-- F9-03a: Rol superadmin
-- Añade 'superadmin' al CHECK constraint de profiles.role y asegura GRANTs
-- en las nuevas columnas SaaS de businesses.

-- Añadir superadmin al contrato de roles (el campo ya era text libre;
-- esto solo documenta los valores válidos y previene typos futuros).
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'employee', 'customer', 'superadmin'));

-- GRANTs para las columnas nuevas de businesses (FX-24 — toda columna nueva lleva GRANTs).
-- La migración 20260630110000 añadió las columnas pero no los GRANTs explícitos.
-- A nivel de tabla ya están cubiertos por 20260630100000_grants_explicit.sql;
-- aquí lo confirmamos con nivel de columna para las columnas sensibles.
-- Nota: REVOKE de escritura en plan/active/trial_ends_at/features FROM authenticated
-- se ejecutará cuando se active Stripe Billing (F9-13) — ver SAAS_FASE9.md §1.1.

GRANT SELECT (plan, active, trial_ends_at, features)
  ON public.businesses TO authenticated, anon, service_role;

GRANT UPDATE (plan, active, trial_ends_at, features)
  ON public.businesses TO service_role;
