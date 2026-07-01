-- F9-03b (complemento): Políticas RLS para superadmin en businesses
-- Permite al superadmin operar sobre cualquier tenant usando sesión SSR
-- en lugar de service_role, alineándose con la convención del proyecto.
--
-- Nota: cuando F9-13 (Stripe Billing) ejecute
--   REVOKE UPDATE (plan, active, trial_ends_at, features) FROM authenticated
-- habrá que añadir un GRANT específico para superadmin o usar una función
-- SECURITY DEFINER — ver docs/SAAS_FASE9.md §1.1.

-- Superadmin puede leer cualquier negocio
CREATE POLICY "superadmin lee todos los negocios"
  ON public.businesses FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- Superadmin puede actualizar plan/estado/trial/features de cualquier negocio
CREATE POLICY "superadmin actualiza cualquier negocio"
  ON public.businesses FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );
