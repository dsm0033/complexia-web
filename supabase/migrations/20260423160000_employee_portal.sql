-- Sprint 5: Portal Empleado
-- Añade checklist_progress a service_records y políticas RLS para empleados
-- NOTA: usar auth.jwt() ->> 'email' en vez de auth.users (sin permisos para usuarios autenticados)

alter table public.service_records
  add column if not exists checklist_progress jsonb default '[]'::jsonb;

-- service_records: empleado ve sus propios trabajos
create policy "empleado ve sus trabajos"
  on public.service_records for select
  using (
    employee_id in (
      select id from public.employees
      where email = auth.jwt() ->> 'email'
    )
  );

-- service_records: empleado actualiza checklist_progress y status
create policy "empleado actualiza su progreso"
  on public.service_records for update
  using (
    employee_id in (
      select id from public.employees
      where email = auth.jwt() ->> 'email'
    )
  )
  with check (
    employee_id in (
      select id from public.employees
      where email = auth.jwt() ->> 'email'
    )
  );

-- employees: empleado puede ver su propio registro
create policy "empleado se ve a si mismo"
  on public.employees for select
  using (email = auth.jwt() ->> 'email');

-- services: empleado ve servicios de su negocio
create policy "empleado ve servicios de su negocio"
  on public.services for select
  using (
    business_id in (
      select business_id from public.employees
      where email = auth.jwt() ->> 'email'
    )
  );

-- checklists: empleado ve checklists de su negocio
create policy "empleado ve checklists de su negocio"
  on public.checklists for select
  using (
    business_id in (
      select business_id from public.employees
      where email = auth.jwt() ->> 'email'
    )
  );

-- customers: empleado ve clientes de su negocio (para mostrar el nombre)
create policy "empleado ve clientes de su negocio"
  on public.customers for select
  using (
    business_id in (
      select business_id from public.employees
      where email = auth.jwt() ->> 'email'
    )
  );
