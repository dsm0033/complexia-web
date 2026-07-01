-- ============================================================
-- MÓDULO VACACIONES Y CONTRATOS
-- ============================================================

-- 1. Datos de contrato y SS por empleado
CREATE TABLE employee_contracts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id           uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  business_id           uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contract_type         text NOT NULL DEFAULT 'indefinido'
                        CHECK (contract_type IN ('indefinido','temporal','parcial','formacion')),
  ss_affiliation_number text,
  ss_group              smallint CHECK (ss_group BETWEEN 1 AND 11),
  start_date            date NOT NULL,
  end_date              date,
  weekly_hours          numeric(4,1) NOT NULL DEFAULT 40,
  gross_salary_monthly  numeric(10,2),
  irpf_percentage       numeric(4,2) DEFAULT 0,
  active                boolean NOT NULL DEFAULT true,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id)
);

-- 2. Días de vacaciones disponibles por empleado y año
CREATE TABLE vacation_entitlements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  business_id    uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  year           smallint NOT NULL,
  total_days     smallint NOT NULL DEFAULT 22,  -- días hábiles (Art. 38 ET: 30 naturales ≈ 22 hábiles)
  carryover_days smallint NOT NULL DEFAULT 0,   -- arrastre por IT/maternidad del año anterior
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, year)
);

-- 3. Solicitudes de vacaciones
CREATE TABLE vacation_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  business_id       uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  start_date        date NOT NULL,
  end_date          date NOT NULL,
  working_days      smallint NOT NULL,  -- días hábiles calculados al crear la solicitud
  status            text NOT NULL DEFAULT 'pendiente'
                    CHECK (status IN ('pendiente','aprobada','rechazada','cancelada')),
  admin_notes       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- 4. Períodos bloqueados para todo el equipo (ej: Semana Santa, agosto)
CREATE TABLE vacation_blackouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  reason      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- 5. Añadir max_concurrent_vacations a business_settings
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS max_concurrent_vacations smallint NOT NULL DEFAULT 1;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE employee_contracts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_blackouts    ENABLE ROW LEVEL SECURITY;

-- employee_contracts: solo admin
CREATE POLICY "admin_all_contracts" ON employee_contracts
  FOR ALL TO authenticated
  USING (
    business_id = (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

-- vacation_entitlements: admin gestiona, empleado ve el suyo
CREATE POLICY "admin_all_entitlements" ON vacation_entitlements
  FOR ALL TO authenticated
  USING (
    business_id = (SELECT business_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "employee_own_entitlement" ON vacation_entitlements
  FOR SELECT TO authenticated
  USING (
    employee_id = (SELECT id FROM employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- vacation_requests: admin ve todas, empleado solo las suyas
CREATE POLICY "admin_all_requests" ON vacation_requests
  FOR ALL TO authenticated
  USING (
    business_id = (SELECT business_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "employee_own_requests" ON vacation_requests
  FOR ALL TO authenticated
  USING (
    employee_id = (SELECT id FROM employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- vacation_blackouts: admin gestiona, empleados pueden leerlos
CREATE POLICY "admin_all_blackouts" ON vacation_blackouts
  FOR ALL TO authenticated
  USING (
    business_id = (SELECT business_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "employee_read_blackouts" ON vacation_blackouts
  FOR SELECT TO authenticated
  USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN employees e ON e.business_id = b.id
      WHERE e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- ============================================================
-- FUNCIÓN: días hábiles entre dos fechas (excluye sáb y dom)
-- ============================================================
CREATE OR REPLACE FUNCTION working_days_between(p_start date, p_end date)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT COUNT(*)::integer
  FROM generate_series(p_start, p_end, '1 day'::interval) d
  WHERE EXTRACT(DOW FROM d) NOT IN (0, 6);  -- 0=domingo, 6=sábado
$$;
