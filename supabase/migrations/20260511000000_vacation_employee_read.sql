-- Columna para saber si el empleado ya vio la resolución (aprobada/rechazada) de su solicitud
ALTER TABLE vacation_requests
  ADD COLUMN IF NOT EXISTS employee_read BOOLEAN NOT NULL DEFAULT TRUE;

-- Las solicitudes ya resueltas que no son pendientes ni canceladas se marcan como no leídas
-- Esto da visibilidad histórica sin romper nada existente.
-- En producción real conviene dejarlas como TRUE (ya están vistas). Si quieres notificar las antiguas, cambia el WHERE.
