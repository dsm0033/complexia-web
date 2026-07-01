-- Sprint 7: Nóminas — almacenamiento de PDFs subidos por el admin
-- Bucket 'nominas' privado en Supabase Storage (solo PDF, máx 10 MB)
-- Tabla payslips: referencia a cada nómina almacenada por empleado y mes

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('nominas', 'nominas', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.payslips (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month       text NOT NULL CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$'), -- YYYY-MM
  file_path   text NOT NULL,
  notes       text,
  uploaded_at timestamptz DEFAULT now(),
  UNIQUE (employee_id, month)
);

ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- Admin gestiona todas las nóminas de su negocio
CREATE POLICY "admin gestiona nóminas"
  ON public.payslips FOR ALL
  USING (
    business_id = public.get_my_business_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    business_id = public.get_my_business_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Empleado solo ve sus propias nóminas
CREATE POLICY "empleado ve sus nóminas"
  ON public.payslips FOR SELECT
  USING (
    employee_id IN (SELECT id FROM public.employees WHERE email = auth.jwt() ->> 'email')
  );
