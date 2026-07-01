-- Hace IMPOSIBLE borrar facturas desde la aplicación.
--
-- Una factura emitida no debe eliminarse nunca: rompería la serie correlativa
-- (IMP-2026-NNNN) e incumpliría la normativa fiscal española (Verifactu /
-- anti-fraude). Para anular una factura real se emite una factura rectificativa.
--
-- Antes, invoices tenía la política "admin_invoices" FOR ALL, que incluía DELETE.
-- La sustituimos por políticas explícitas de SELECT / INSERT / UPDATE para el
-- admin, SIN DELETE. Así ni el panel ni cualquier código que use el cliente
-- autenticado puede borrar facturas. (El service_role sigue pudiendo, para
-- tareas de mantenimiento controladas — no se expone en la app.)

DROP POLICY IF EXISTS "admin_invoices" ON public.invoices;

CREATE POLICY "admin_invoices_select" ON public.invoices
  FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_invoices_insert" ON public.invoices
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_invoices_update" ON public.invoices
  FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sin política FOR DELETE: el borrado de facturas queda bloqueado.
