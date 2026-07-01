-- Permite a los empleados LEER los días bloqueados (festivos / cierres) de su negocio,
-- para mostrarlos en su calendario personal (/empleado/calendario).
-- Hasta ahora blocked_dates era admin-only (ver 20260426100000_booking_config.sql).
-- Mismo patrón que employee_read_blackouts (20260426120000_vacaciones.sql): lectura
-- restringida al negocio al que pertenece el empleado por su email.

CREATE POLICY "employee_read_blocked_dates" ON public.blocked_dates
  FOR SELECT TO authenticated
  USING (
    business_id IN (
      SELECT e.business_id FROM public.employees e
      WHERE e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
