create table if not exists public.service_records (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  service_id  uuid references public.services(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  date        date not null default current_date,
  price       numeric not null,
  status      text not null default 'completado',
  notes       text,
  created_at  timestamptz default now()
);

alter table public.service_records enable row level security;

create policy "admin lee historial del negocio"
  on public.service_records for select
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin crea registros"
  on public.service_records for insert
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin edita registros del negocio"
  on public.service_records for update
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin elimina registros del negocio"
  on public.service_records for delete
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
