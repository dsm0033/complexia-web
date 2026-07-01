alter table public.services
  add column if not exists checklist_id uuid references public.checklists(id) on delete set null;
