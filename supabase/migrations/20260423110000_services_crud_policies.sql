-- Políticas de INSERT y DELETE para servicios (el UPDATE ya existía)

create policy "admin crea servicios"
  on public.services for insert
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin elimina servicios"
  on public.services for delete
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
