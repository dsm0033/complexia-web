-- Fix: cualquier usuario (anon o autenticado) puede leer servicios activos
-- Necesario para que /reservar funcione con clientes autenticados

create policy "público lee servicios activos"
  on public.services for select
  using (active = true);
