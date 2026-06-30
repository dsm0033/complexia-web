import { celdasMes, construirCeldasEmpleado, isoLocal } from './agenda'

// Carga y ensambla las celdas del calendario mensual de un empleado.
// Reutilizable desde el portal (/empleado/calendario) y desde la ficha admin
// (/admin/empleados/[id]/calendario): la diferencia es solo qué cliente Supabase
// y qué employeeId/businessId se pasan.
export async function cargarCalendarioEmpleado(supabase, { employeeId, businessId, mes }) {
  const baseDate = `${mes}-01`
  const celdas = celdasMes(baseDate)
  const desde = celdas[0]
  const hasta = celdas[celdas.length - 1]

  const [{ data: registros }, { data: vacs }, { data: festivosRows }, { data: horarios }] = await Promise.all([
    supabase
      .from('service_records')
      .select('date, status, services(name, duration_minutes), bookings(time_slot)')
      .eq('employee_id', employeeId)
      .gte('date', desde)
      .lte('date', hasta)
      .neq('status', 'cancelado'),
    supabase
      .from('vacation_requests')
      .select('start_date, end_date')
      .eq('employee_id', employeeId)
      .eq('status', 'aprobada')
      .lte('start_date', hasta)   // solapamiento con el rango visible
      .gte('end_date', desde),
    supabase
      .from('blocked_dates')
      .select('date, reason')
      .eq('business_id', businessId)
      .gte('date', desde)
      .lte('date', hasta),
    supabase
      .from('business_hours')
      .select('day_of_week, is_open')
      .eq('business_id', businessId),
  ])

  const trabajosPorDia = {}
  for (const r of registros ?? []) {
    ;(trabajosPorDia[r.date] ??= []).push({
      servicio: r.services?.name ?? 'Servicio',
      status: r.status,
      hora: r.bookings?.time_slot ? String(r.bookings.time_slot).slice(0, 5) : null,
      duracion: r.services?.duration_minutes ?? null,
    })
  }
  // Ordena los trabajos de cada día por hora (los sin hora, al final)
  for (const k of Object.keys(trabajosPorDia)) {
    trabajosPorDia[k].sort((a, b) => (a.hora ?? '99:99').localeCompare(b.hora ?? '99:99'))
  }
  const vacaciones = (vacs ?? []).map(v => ({ start: v.start_date, end: v.end_date }))
  const festivos = Object.fromEntries((festivosRows ?? []).map(f => [f.date, f.reason || 'Festivo']))
  const diasCerrados = new Set((horarios ?? []).filter(h => !h.is_open).map(h => h.day_of_week))

  return construirCeldasEmpleado({
    baseDate,
    hoy: isoLocal(new Date()),
    trabajosPorDia,
    vacaciones,
    festivos,
    diasCerrados,
  })
}
