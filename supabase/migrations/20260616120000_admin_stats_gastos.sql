-- Dashboard admin — añade el gasto del mes a get_admin_stats
--
-- El dashboard pasa a mostrar la cifra de "Gastos este mes" (antes era solo un
-- acceso). Sumamos expenses.amount del mes en curso, igual criterio que
-- 'totalFacturado'. Con gastosMes + totalFacturado el front puede mostrar
-- también el beneficio (ingresos − gastos) sin más queries.
--
-- CREATE OR REPLACE: redefinimos la función completa (Postgres no permite
-- añadir un campo suelto al json_build_object).

CREATE OR REPLACE FUNCTION public.get_admin_stats(p_business_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_desde date := date_trunc('month', current_date)::date;
BEGIN
  -- Solo admins del negocio solicitado pueden invocarla
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND business_id = p_business_id
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'P0001';
  END IF;

  RETURN json_build_object(
    'clients',              (SELECT count(*) FROM customers           WHERE business_id = p_business_id),
    'employees',            (SELECT count(*) FROM employees           WHERE business_id = p_business_id AND active = true),
    'services',             (SELECT count(*) FROM services            WHERE business_id = p_business_id AND active = true),
    'serviciosMes',         (SELECT count(*) FROM service_records     WHERE business_id = p_business_id AND date >= v_desde),
    'pendingServices',      (SELECT count(*) FROM service_records     WHERE business_id = p_business_id AND status = 'pendiente'),
    'reservasMes',          (SELECT count(*) FROM bookings            WHERE business_id = p_business_id AND date >= v_desde),
    'reservasPendientes',   (SELECT count(*) FROM bookings            WHERE business_id = p_business_id AND status = 'pendiente'),
    'totalFacturado',       (SELECT COALESCE(SUM(total_amount), 0) FROM invoices  WHERE business_id = p_business_id AND invoice_date >= v_desde),
    'gastosMes',            (SELECT COALESCE(SUM(amount), 0)       FROM expenses  WHERE business_id = p_business_id AND date >= v_desde),
    'checklists',           (SELECT count(*) FROM checklists          WHERE business_id = p_business_id),
    'vacacionesPendientes', (SELECT count(*) FROM vacation_requests   WHERE business_id = p_business_id AND status = 'pendiente'),
    'nominasConContrato',   (SELECT count(*) FROM employee_contracts  WHERE business_id = p_business_id AND active = true)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_stats(uuid) TO authenticated;
