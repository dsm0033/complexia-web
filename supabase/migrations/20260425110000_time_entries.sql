-- Sprint 7: Sistema de fichaje (entradas y salidas de turno)
create table public.time_entries (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  clock_in    timestamptz not null default now(),
  clock_out   timestamptz,
  date        date not null default current_date,
  notes       text,
  created_at  timestamptz default now()
);

alter table public.time_entries enable row level security;

-- Empleado ve sus propios fichajes
create policy "empleado ve sus fichajes"
  on public.time_entries for select
  using (
    employee_id in (
      select id from public.employees where email = auth.jwt() ->> 'email'
    )
  );

-- Empleado ficha entrada
create policy "empleado ficha entrada"
  on public.time_entries for insert
  with check (
    employee_id in (
      select id from public.employees where email = auth.jwt() ->> 'email'
    )
  );

-- Empleado ficha salida (actualiza su propio registro abierto)
create policy "empleado ficha salida"
  on public.time_entries for update
  using (
    employee_id in (
      select id from public.employees where email = auth.jwt() ->> 'email'
    )
  )
  with check (
    employee_id in (
      select id from public.employees where email = auth.jwt() ->> 'email'
    )
  );

-- Admin ve todos los fichajes del negocio
create policy "admin ve fichajes del negocio"
  on public.time_entries for select
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Admin puede corregir fichajes del negocio
create policy "admin edita fichajes del negocio"
  on public.time_entries for update
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
