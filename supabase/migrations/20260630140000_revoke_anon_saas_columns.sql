-- Preventivo: revocar SELECT en columnas SaaS a anon
-- La migración 20260630120000 concedió SELECT a anon por defecto.
-- Con RLS activo hoy no hay riesgo, pero si en el futuro se añade
-- una policy permisiva para anon en businesses, estos campos quedarían
-- expuestos. Se revoca ahora para cerrar la superficie.
REVOKE SELECT (plan, active, trial_ends_at, features)
  ON public.businesses FROM anon;
