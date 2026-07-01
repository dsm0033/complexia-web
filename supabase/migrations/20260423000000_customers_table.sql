-- Tabla de clientes gestionados por el admin
-- No requiere cuenta de auth; en Sprint 6 se enlazará con auth.users

create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  full_name   text not null,
  email       text,
  phone       text,
  created_at  timestamptz default now()
);

alter table public.customers enable row level security;

create policy "admin lee clientes del negocio"
  on public.customers for select
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin crea clientes"
  on public.customers for insert
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin edita clientes del negocio"
  on public.customers for update
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin elimina clientes del negocio"
  on public.customers for delete
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
