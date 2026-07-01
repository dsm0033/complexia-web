-- Sprint 7: Control de horario y disponibilidad de reservas
-- business_settings: config general (capacidad, duración de slot, festivos)
-- business_hours: horario semanal del negocio por día
-- blocked_dates: días cerrados (festivos importados o cierres manuales)
-- + employee_id nullable en bookings (preparar futura asignación de empleados)
-- day_of_week: 0=lunes … 6=domingo (convención española, igual que employee_schedules)

-- ============================================================
-- business_settings: una fila por negocio
-- ============================================================
create table public.business_settings (
  id                      uuid primary key default gen_random_uuid(),
  business_id             uuid not null unique references public.businesses(id) on delete cascade,
  slot_duration_minutes   int not null default 60 check (slot_duration_minutes > 0),
  max_concurrent_bookings int not null default 1  check (max_concurrent_bookings > 0),
  booking_advance_days    int not null default 60 check (booking_advance_days > 0),
  use_national_holidays   bool not null default false,
  holiday_country         text not null default 'ES',
  holiday_region          text, -- código CCAA: 'MD', 'AN', 'CT', etc. — null = solo festivos nacionales
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ============================================================
-- business_hours: horario semanal (una fila por día por negocio)
-- lunch_break_start/end nullable → sin pausa de comida
-- ============================================================
create table public.business_hours (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  day_of_week       int not null check (day_of_week between 0 and 6),
  is_open           bool not null default true,
  open_time         time not null default '09:00',
  close_time        time not null default '18:00',
  lunch_break_start time,
  lunch_break_end   time,
  unique (business_id, day_of_week)
);

-- ============================================================
-- blocked_dates: días no disponibles para reservas
-- source distingue manuales de importados para poder borrar por lotes
-- ============================================================
create table public.blocked_dates (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  date        date not null,
  reason      text,
  source      text not null default 'manual'
              check (source in ('manual', 'national_holiday', 'regional_holiday')),
  created_at  timestamptz default now(),
  unique (business_id, date)
);

-- ============================================================
-- employee_id en bookings (nullable — futura asignación automática)
-- ============================================================
alter table public.bookings
  add column employee_id uuid references public.employees(id) on delete set null;

-- ============================================================
-- RLS
-- ============================================================
alter table public.business_settings enable row level security;
alter table public.business_hours     enable row level security;
alter table public.blocked_dates      enable row level security;

create policy "admin gestiona config reservas"
  on public.business_settings for all
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin gestiona horario negocio"
  on public.business_hours for all
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin gestiona días bloqueados"
  on public.blocked_dates for all
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- ============================================================
-- Seed: valores por defecto para el negocio existente
-- Lun-Vie: 09:00-19:00 con pausa 14:00-16:00
-- Sáb-Dom: cerrado (el admin lo puede cambiar desde el panel)
-- ============================================================
do $$
declare v_bid uuid;
begin
  select id into v_bid from public.businesses limit 1;
  if v_bid is null then return; end if;

  insert into public.business_settings (business_id)
    values (v_bid)
    on conflict (business_id) do nothing;

  insert into public.business_hours
    (business_id, day_of_week, is_open, open_time, close_time, lunch_break_start, lunch_break_end)
  values
    (v_bid, 0, true,  '09:00', '19:00', '14:00', '16:00'),
    (v_bid, 1, true,  '09:00', '19:00', '14:00', '16:00'),
    (v_bid, 2, true,  '09:00', '19:00', '14:00', '16:00'),
    (v_bid, 3, true,  '09:00', '19:00', '14:00', '16:00'),
    (v_bid, 4, true,  '09:00', '19:00', '14:00', '16:00'),
    (v_bid, 5, false, '09:00', '14:00', null,     null  ),
    (v_bid, 6, false, '09:00', '14:00', null,     null  )
  on conflict (business_id, day_of_week) do nothing;
end $$;
