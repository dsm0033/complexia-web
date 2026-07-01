-- Sprint 9: Contratos de empleados — base para el cálculo automático de nóminas
-- Requiere: 20260506000000_payroll_reference_tables.sql (contribution_groups, ss_rates, etc.)

CREATE TABLE public.employee_contracts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id         uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,

  -- Tipo y vigencia
  contract_type       text NOT NULL DEFAULT 'indefinido'
                        CHECK (contract_type IN ('indefinido', 'temporal', 'formacion', 'practicas')),
  start_date          date NOT NULL,
  end_date            date,  -- NULL = indefinido o sin fecha de fin pactada

  -- Retribución
  gross_annual        numeric(10,2) NOT NULL CHECK (gross_annual > 0),
  -- 14 pagas: 12 mensualidades + extra junio + extra diciembre (más habitual en convenio)
  -- 12 pagas: salario anual prorrateado en 12 mensualidades iguales
  num_payments        int NOT NULL DEFAULT 14 CHECK (num_payments IN (12, 14)),

  -- Jornada (referencia para horas extra y cotización parcial)
  weekly_hours        numeric(4,1) NOT NULL DEFAULT 37.5
                        CHECK (weekly_hours > 0 AND weekly_hours <= 37.5),

  -- Grupo de cotización SS (1–11)
  -- Referencia lógica a contribution_groups(year, group_number)
  -- Para detailing/limpieza lo habitual es grupo 9 (Oficiales de tercera) o 10 (Peones)
  contribution_group  int NOT NULL DEFAULT 9
                        CHECK (contribution_group BETWEEN 1 AND 11),

  -- Categoría descriptiva según convenio colectivo aplicable
  category            text,  -- ej: "Operario de limpieza", "Oficial de primera"

  -- IRPF: porcentaje de retención mensual acordado con el empleado
  -- 0 = el motor calcula la estimación automática con irpf_brackets del año en curso
  irpf_rate           numeric(5,2) NOT NULL DEFAULT 0
                        CHECK (irpf_rate >= 0 AND irpf_rate <= 47),

  -- Datos personales necesarios para el PDF de nómina
  dni                 text,        -- DNI / NIE del trabajador
  ss_affiliation      text,        -- Número de afiliación a la Seguridad Social (NAF)

  -- Estado: solo un contrato activo por empleado (ver índice único parcial abajo)
  active              boolean NOT NULL DEFAULT true,

  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Garantiza un único contrato activo por empleado
-- Para subidas de sueldo: desactivar el anterior y crear uno nuevo (queda historial)
CREATE UNIQUE INDEX employee_contracts_one_active
  ON public.employee_contracts (employee_id)
  WHERE active = true;

ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin gestiona contratos de su negocio"
  ON public.employee_contracts FOR ALL
  USING (
    business_id = public.get_my_business_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    business_id = public.get_my_business_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
