create table if not exists public.employees (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  full_name   text not null,
  email       text,
  phone       text,
  position    text,
  active      boolean default true,
  created_at  timestamptz default now()
);

alter table public.employees enable row level security;

create policy "admin lee empleados del negocio"
  on public.employees for select
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin crea empleados"
  on public.employees for insert
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin edita empleados del negocio"
  on public.employees for update
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin elimina empleados del negocio"
  on public.employees for delete
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
