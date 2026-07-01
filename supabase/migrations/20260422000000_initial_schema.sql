-- Initial schema migration
-- Generated 2026-04-22 from remote Supabase project

-- Helper function: returns the business_id of the logged-in user
create or replace function public.get_my_business_id()
returns uuid
language sql
security definer
set search_path = ''
as $$
  select business_id from public.profiles where id = auth.uid() limit 1;
$$;

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  address     text,
  created_at  timestamptz default now()
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  full_name   text,
  phone       text,
  role        text not null,
  created_at  timestamptz default now()
);

create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid references public.businesses(id) on delete cascade,
  name             text not null,
  description      text,
  price            numeric,
  duration_minutes integer,
  active           boolean default true,
  icon             text default 'Wrench',
  highlight        boolean default false,
  created_at       timestamptz default now()
);

create table if not exists public.checklists (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  name        text not null,
  items       jsonb default '[]'::jsonb,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.businesses  enable row level security;
alter table public.profiles    enable row level security;
alter table public.services    enable row level security;
alter table public.checklists  enable row level security;

-- profiles
create policy "leer perfil propio"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admin lee perfiles del negocio"
  on public.profiles for select
  using (business_id = get_my_business_id());

create policy "actualizar perfil propio"
  on public.profiles for update
  using (auth.uid() = id);

-- services
create policy "leer servicios del negocio"
  on public.services for select
  using (business_id = get_my_business_id());

create policy "servicios visibles al público"
  on public.services for select
  to anon
  using (true);

create policy "admin actualiza servicios"
  on public.services for update
  using  (business_id = get_my_business_id())
  with check (business_id = get_my_business_id());

-- businesses
create policy "admin lee su negocio"
  on public.businesses for select
  using (
    id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin actualiza su negocio"
  on public.businesses for update
  using (
    id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- checklists
create policy "miembros ven checklists del negocio"
  on public.checklists for select
  using (business_id = public.get_my_business_id());

create policy "miembros actualizan checklists del negocio"
  on public.checklists for update
  using (business_id = public.get_my_business_id())
  with check (business_id = public.get_my_business_id());

create policy "admin crea checklists"
  on public.checklists for insert
  with check (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "admin elimina checklists"
  on public.checklists for delete
  using (
    business_id = public.get_my_business_id()
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
