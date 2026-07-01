-- Fix RLS: reemplazar auth.users (sin acceso) por auth.email()

DROP POLICY IF EXISTS "employee_own_entitlement" ON vacation_entitlements;
CREATE POLICY "employee_own_entitlement" ON vacation_entitlements
  FOR SELECT TO authenticated
  USING (
    employee_id = (SELECT id FROM employees WHERE email = auth.email())
  );

DROP POLICY IF EXISTS "employee_own_requests" ON vacation_requests;
CREATE POLICY "employee_own_requests" ON vacation_requests
  FOR ALL TO authenticated
  USING (
    employee_id = (SELECT id FROM employees WHERE email = auth.email())
  );

DROP POLICY IF EXISTS "employee_read_blackouts" ON vacation_blackouts;
CREATE POLICY "employee_read_blackouts" ON vacation_blackouts
  FOR SELECT TO authenticated
  USING (
    business_id IN (
      SELECT e.business_id FROM employees e WHERE e.email = auth.email()
    )
  );
