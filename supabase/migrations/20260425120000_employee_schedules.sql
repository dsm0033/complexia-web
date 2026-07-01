-- Sprint 7: Horario laboral contratado por empleado y día de la semana
-- day_of_week: 0=lunes, 1=martes, ..., 6=domingo (convención española)
-- contracted_minutes = 0 → día libre
-- effective_until = null → horario vigente
-- Soporta histórico: cuando cambia el contrato se cierra el registro anterior
--   y se abre uno nuevo con effective_from = fecha del cambio

create table public.employee_schedules (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid not null references public.businesses(id) on delete cascade,
  employee_id        uuid not null references public.employees(id) on delete cascade,
  day_of_week        int not null check (day_of_week between 0 and 6),
  contracted_minutes int not null default 0 check (contracted_minutes >= 0),
  effective_from     date not null default current_date,
  effective_until    date,
  created_at         timestamptz default now(),
  -- Solo puede haber un horario activo (sin fecha fin) por empleado y día
  constraint uq_employee_day_active
    unique nulls not distinct (employee_id, day_of_week, effective_until)
);

alter table public.employee_schedules enable row level security;

-- Admin puede gestionar los horarios de su negocio
create policy "admin gestiona horarios del negocio"
  on public.employee_schedules for all
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Empleado puede ver su propio horario
create policy "empleado ve su horario"
  on public.employee_schedules for select
  using (
    employee_id in (
      select id from public.employees where email = auth.jwt() ->> 'email'
    )
  );
