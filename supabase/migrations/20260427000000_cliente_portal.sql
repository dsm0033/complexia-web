-- Sprint 8: Portal Cliente
-- Vincula customers con auth.users y añade RLS para el portal del cliente

-- 1. Columna user_id en customers
alter table public.customers
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists customers_user_id_idx on public.customers(user_id);

-- 2. Cliente puede leer su propio perfil
create policy "cliente lee su propio perfil"
  on public.customers for select
  using (user_id = auth.uid());

-- 3. Cliente puede editar sus propios datos
create policy "cliente edita su propio perfil"
  on public.customers for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. Cliente puede ver su historial de servicios
-- NOTA (fix reproducibilidad, 1 Jul 2026): esta policy ya se creó en
-- 20260425000000_oauth_google.sql. El DROP evita "policy already exists" al
-- reproducir las migraciones desde cero (hallazgo A3 de AUDITORIA_31052026.md).
drop policy if exists "cliente lee su historial" on public.service_records;
create policy "cliente lee su historial"
  on public.service_records for select
  using (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    )
  );

-- 5. Cliente puede ver sus propias reservas (vinculadas por email)
create policy "cliente lee sus reservas"
  on public.bookings for select
  using (
    customer_email = (select email from auth.users where id = auth.uid())
  );
