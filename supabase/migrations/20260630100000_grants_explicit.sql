-- FX-24: GRANTs explícitos en todas las tablas del esquema public
-- Supabase eliminará el auto-grant en esquema public (deadline 30/10/2026).
-- Sin estos GRANTs, supabase-js devuelve error 42501 (permission denied).
-- La seguridad real la siguen gestionando las políticas RLS de cada tabla.

-- ── Tablas existentes ──────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL                            ON ALL TABLES IN SCHEMA public TO service_role;

-- ── Tablas futuras (se aplica a cada CREATE TABLE nuevo en public) ─────────────

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
