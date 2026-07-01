-- Sprint 9: Tablas de referencia fiscal para el motor de nóminas
-- Sin hardcodear valores: todo lo que cambia anualmente vive aquí.
-- Actualizar cada enero con los valores de la nueva Orden de cotización.

-- ─────────────────────────────────────────────
-- 1. GRUPOS DE COTIZACIÓN
--    Bases mínimas por grupo y año (Orden PJC/297/2026)
--    Grupos 1–7: base mensual | Grupos 8–11: base diaria
-- ─────────────────────────────────────────────
CREATE TABLE public.contribution_groups (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year         int  NOT NULL CHECK (year >= 2026),
  group_number int  NOT NULL CHECK (group_number BETWEEN 1 AND 11),
  name         text NOT NULL,
  base_type    text NOT NULL CHECK (base_type IN ('monthly', 'daily')),
  min_base     numeric(10,2) NOT NULL CHECK (min_base > 0),
  UNIQUE (year, group_number)
);

INSERT INTO public.contribution_groups (year, group_number, name, base_type, min_base) VALUES
  (2026,  1, 'Ingenieros y Licenciados',                         'monthly', 1847.40),
  (2026,  2, 'Ingenieros Técnicos, Peritos y Ayudantes Titulados','monthly', 1531.80),
  (2026,  3, 'Jefes Administrativos y de Taller',                'monthly', 1332.90),
  (2026,  4, 'Ayudantes no Titulados',                           'monthly', 1323.90),
  (2026,  5, 'Oficiales Administrativos',                        'monthly', 1323.90),
  (2026,  6, 'Subalternos',                                      'monthly', 1323.90),
  (2026,  7, 'Auxiliares Administrativos',                       'monthly', 1323.90),
  (2026,  8, 'Oficiales de primera y segunda',                   'daily',     44.13),
  (2026,  9, 'Oficiales de tercera y Especialistas',             'daily',     44.13),
  (2026, 10, 'Peones',                                           'daily',     44.13),
  (2026, 11, 'Trabajadores menores de 18 años',                  'daily',     44.13);

-- ─────────────────────────────────────────────
-- 2. TIPOS DE COTIZACIÓN SS
--    Porcentajes trabajador/empresa por concepto y año
--    Fuente: Orden PJC/297/2026 + RDL 3/2026
-- ─────────────────────────────────────────────
CREATE TABLE public.ss_rates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year         int  NOT NULL CHECK (year >= 2026),
  concept      text NOT NULL,
  worker_rate  numeric(5,2) NOT NULL DEFAULT 0 CHECK (worker_rate >= 0),
  company_rate numeric(5,2) NOT NULL DEFAULT 0 CHECK (company_rate >= 0),
  UNIQUE (year, concept)
);

INSERT INTO public.ss_rates (year, concept, worker_rate, company_rate) VALUES
  -- Contingencias comunes (28,30% total)
  (2026, 'contingencias_comunes',    4.70, 23.60),
  -- Desempleo — según tipo de contrato
  (2026, 'desempleo_indefinido',     1.55,  5.50),
  (2026, 'desempleo_temporal',       1.60,  6.70),
  -- Otros conceptos
  (2026, 'formacion_profesional',    0.10,  0.60),
  (2026, 'fogasa',                   0.00,  0.20),
  -- MEI: Mecanismo de Equidad Intergeneracional (RDL 2/2023)
  (2026, 'mei',                      0.15,  0.75);

-- ─────────────────────────────────────────────
-- 3. TRAMOS IRPF (tramos estatales — sin autonómicos)
--    La retención en nómina es una estimación del IRPF anual.
--    El SMI queda exento. Las CCAA añaden tipos propios no incluidos aquí.
-- ─────────────────────────────────────────────
CREATE TABLE public.irpf_brackets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year       int          NOT NULL CHECK (year >= 2026),
  min_income numeric(12,2) NOT NULL CHECK (min_income >= 0),
  max_income numeric(12,2),           -- NULL = sin límite superior
  rate       numeric(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  UNIQUE (year, min_income)
);

INSERT INTO public.irpf_brackets (year, min_income, max_income, rate) VALUES
  (2026,      0.00,  12450.00, 19.00),
  (2026,  12450.00,  20200.00, 24.00),
  (2026,  20200.00,  35200.00, 30.00),
  (2026,  35200.00,  60000.00, 37.00),
  (2026,  60000.00, 300000.00, 45.00),
  (2026, 300000.00,       NULL, 47.00);

-- ─────────────────────────────────────────────
-- 4. CONFIGURACIÓN GLOBAL DE NÓMINA POR AÑO
--    Valores únicos que cambian anualmente: SMI, base máxima, etc.
-- ─────────────────────────────────────────────
CREATE TABLE public.payroll_settings (
  year  int  NOT NULL,
  key   text NOT NULL,
  value numeric(12,4) NOT NULL,
  PRIMARY KEY (year, key)
);

INSERT INTO public.payroll_settings (year, key, value) VALUES
  -- SMI 2026: 1.221 €/mes en 14 pagas (RD 126/2026)
  (2026, 'smi_monthly_14pagas',   1221.00),
  -- Base máxima de cotización (igual para todos los grupos)
  (2026, 'base_max_monthly',      5101.20),
  (2026, 'base_max_daily',         170.04),
  -- Jornada máxima legal 2026 (reducción a 37,5h semanales)
  (2026, 'max_weekly_hours',         37.50);

-- ─────────────────────────────────────────────
-- RLS — datos de referencia global (sin business_id)
-- Lectura: cualquier usuario autenticado (necesario para el motor de cálculo)
-- Escritura: solo admin (en SaaS será superadmin)
-- ─────────────────────────────────────────────
ALTER TABLE public.contribution_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ss_rates            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irpf_brackets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura autenticada"
  ON public.contribution_groups FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin escribe grupos cotizacion"
  ON public.contribution_groups FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "lectura autenticada"
  ON public.ss_rates FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin escribe tipos ss"
  ON public.ss_rates FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "lectura autenticada"
  ON public.irpf_brackets FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin escribe tramos irpf"
  ON public.irpf_brackets FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "lectura autenticada"
  ON public.payroll_settings FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin escribe config nomina"
  ON public.payroll_settings FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
