-- Sprint 10 — añade categorías mantenimiento_web e ia a expenses
--
-- Hoy: suministros, alquiler, nominas, material, publicidad, otros.
-- Nuevas: mantenimiento_web (hosting/dominio/Vercel/Supabase) e ia
-- (créditos de Anthropic, OpenAI y similares).

ALTER TABLE public.expenses
  DROP CONSTRAINT IF EXISTS expenses_category_check;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_category_check
  CHECK (category IN (
    'suministros',
    'alquiler',
    'nominas',
    'material',
    'publicidad',
    'mantenimiento_web',
    'ia',
    'otros'
  ));
