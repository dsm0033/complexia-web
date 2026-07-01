-- Revisión Pre-SaaS (#23) — admin gestiona Storage bucket "nominas" sin service_role
--
-- Antes: admin/empleados/[id]/nominas/actions.js subía/borraba PDFs en el
-- bucket usando service_role porque las policies de storage.objects para
-- ese bucket no existían. La tabla payslips ya tiene policy admin FOR ALL;
-- el endpoint público api/nominas/[id]/download/route.js mantiene service_role
-- a propósito (firma URLs cortas tras validar payslip por RLS), eso no cambia.
--
-- Estas policies permiten al admin autenticado upload/update/delete/select
-- sobre el bucket "nominas" sin saltar RLS.

CREATE POLICY "admin sube nóminas al bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'nominas'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin actualiza nóminas en el bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'nominas'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    bucket_id = 'nominas'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin elimina nóminas del bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'nominas'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin lee nóminas del bucket"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'nominas'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
