-- Permite al admin ELIMINAR reservas de su negocio.
--
-- bookings tenía RLS con políticas de SELECT, UPDATE (admin) e INSERT (público),
-- pero NINGUNA de DELETE. Con RLS activo, un DELETE desde el cliente autenticado
-- (server actions vía getAdminCtx) no lanza error: simplemente afecta 0 filas.
-- Síntoma: el botón "Eliminar" del panel de Reservas no hacía nada.
-- (El botón "Cancelar" sí funciona porque es UPDATE y esa política sí existe.)
--
-- Las mutaciones por service_role (webhooks) no se ven afectadas: saltan RLS.

CREATE POLICY "admin elimina reservas"
  ON public.bookings FOR DELETE
  USING (
    business_id = public.get_my_business_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
