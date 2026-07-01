-- Sprint 5 cierre: tiempos y estados del servicio
alter table public.service_records
  add column if not exists started_at   timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists is_paid      boolean not null default false,
  add column if not exists is_collected boolean not null default false;
