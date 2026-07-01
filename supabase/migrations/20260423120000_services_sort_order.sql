alter table public.services add column if not exists sort_order integer default 0;

-- Asignar orden inicial basado en el nombre dentro de cada negocio
update public.services
set sort_order = sub.rn
from (
  select id, row_number() over (partition by business_id order by name) as rn
  from public.services
) sub
where public.services.id = sub.id;
