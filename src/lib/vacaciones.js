// ¿El empleado tiene una solicitud de vacaciones APROBADA que cubre `date`?
// Se usa para impedir que se asigne un trabajo a un empleado que está de vacaciones.
export async function empleadoDeVacaciones(supabase, employeeId, date) {
  if (!employeeId || !date) return false
  const { data } = await supabase
    .from('vacation_requests')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('status', 'aprobada')
    .lte('start_date', date)   // la vacación empieza en o antes de la fecha
    .gte('end_date', date)     // y termina en o después → la fecha cae dentro
    .limit(1)
  return (data?.length ?? 0) > 0
}

// Nº de trabajos (service_records no cancelados) asignados a un empleado dentro de
// un rango de fechas. Se usa para impedir aprobar una vacación si ya hay trabajo
// asignado en esos días (el conflicto inverso).
export async function trabajosAsignadosEnRango(supabase, employeeId, startDate, endDate) {
  if (!employeeId || !startDate || !endDate) return 0
  const { count } = await supabase
    .from('service_records')
    .select('id', { count: 'exact', head: true })
    .eq('employee_id', employeeId)
    .neq('status', 'cancelado')
    .gte('date', startDate)
    .lte('date', endDate)
  return count ?? 0
}

// Vacaciones aprobadas del negocio agrupadas por empleado: { employeeId: [{ start, end }] }.
// Se pasa al formulario de Historial para avisar en cliente si la fecha cae en vacaciones.
export async function cargarVacacionesPorEmpleado(supabase, businessId) {
  const { data } = await supabase
    .from('vacation_requests')
    .select('employee_id, start_date, end_date')
    .eq('business_id', businessId)
    .eq('status', 'aprobada')
  const map = {}
  for (const v of data ?? []) {
    ;(map[v.employee_id] ??= []).push({ start: v.start_date, end: v.end_date })
  }
  return map
}
