-- Revisión Pre-SaaS (#21) — empleado actualiza su propio IBAN sin service_role
--
-- Antes: empleado/actions.js usaba service_role para actualizar employees.iban
-- de su propia fila — saltándose RLS innecesariamente. La alternativa "policy
-- UPDATE general al empleado" daría acceso a cualquier columna (salario, role,
-- business_id...), lo que es inaceptable.
--
-- Esta función SECURITY DEFINER limita la operación a una sola columna (iban)
-- y verifica que el empleado solo actualiza su propia fila vía auth.jwt().

CREATE OR REPLACE FUNCTION public.actualizar_iban_empleado(p_iban text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  v_email := auth.jwt() ->> 'email';

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'no_session' USING ERRCODE = 'P0001';
  END IF;

  -- Validación de formato IBAN español (ES + 22 dígitos) o null para limpiar
  IF p_iban IS NOT NULL AND p_iban !~ '^ES[0-9]{22}$' THEN
    RAISE EXCEPTION 'invalid_iban_format' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.employees
     SET iban = p_iban
   WHERE email = v_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'employee_not_found' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.actualizar_iban_empleado(text) TO authenticated;
