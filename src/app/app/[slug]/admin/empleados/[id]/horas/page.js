import { getAdminPageCtx } from '@/lib/admin-context'
import { notFound } from 'next/navigation'
import {
  startOfWeek, calcMinutos, formatHoras, formatDiferencia,
  formatHora, minutosEntreFechas, jsDayToEs, agruparPorSemana,
} from '@/lib/horas'

export async function generateMetadata({ params }) {
  return { title: 'Horas trabajadas · Admin IMPECABLE' }
}

export default async function HorasEmpleadoPage({ params }) {
  const { slug, id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const semanaInicio = startOfWeek(now).toISOString().split('T')[0]
  const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const historialInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]

  const [{ data: empleado }, { data: entradas }, { data: schedules }] = await Promise.all([
    supabase
      .from('employees')
      .select('id, full_name, position')
      .eq('id', id)
      .eq('business_id', businessId)
      .single(),
    supabase
      .from('time_entries')
      .select('id, date, clock_in, clock_out, notes')
      .eq('employee_id', id)
      .gte('date', historialInicio)
      .order('date', { ascending: false })
      .order('clock_in', { ascending: false }),
    supabase
      .from('employee_schedules')
      .select('day_of_week, contracted_minutes')
      .eq('employee_id', id)
      .is('effective_until', null),
  ])

  if (!empleado) notFound()

  const todas  = entradas ?? []
  const nowStr = now.toISOString()

  const horario = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, 0]))
  ;(schedules ?? []).forEach(s => { horario[s.day_of_week] = s.contracted_minutes })

  function contratadosParaDia(dateStr) {
    return horario[jsDayToEs(new Date(dateStr).getDay())] ?? 0
  }

  const minHoy    = calcMinutos(todas.filter(e => e.date === today), nowStr)
  const minSemana = calcMinutos(todas.filter(e => e.date >= semanaInicio), nowStr)
  const minMes    = calcMinutos(todas.filter(e => e.date >= mesInicio), nowStr)

  const porSemana = agruparPorSemana(todas)
  const semanas   = Object.entries(porSemana).sort(([a], [b]) => b.localeCompare(a))

  const tieneHorario = (schedules ?? []).some(s => s.contracted_minutes > 0)

  const resumen = [
    { label: 'Hoy',         valor: formatHoras(minHoy) },
    { label: 'Esta semana', valor: formatHoras(minSemana) },
    { label: 'Este mes',    valor: formatHoras(minMes) },
  ]

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <a href={`/app/${slug}/admin/empleados`} className="hover:text-gray-700">Empleados</a>
          <span>/</span>
          <a href={`/app/${slug}/admin/empleados/${id}/editar`} className="hover:text-gray-700">{empleado.full_name}</a>
          <span>/</span>
          <span>Horas</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Horas trabajadas</h1>
            <p className="text-gray-500 mt-1">
              {empleado.full_name}
              {empleado.position && <span className="text-gray-400"> · {empleado.position}</span>}
            </p>
          </div>
          <a
            href={`/app/${slug}/admin/empleados/${id}/horario`}
            className="text-sm text-blue-600 hover:underline"
          >
            {tieneHorario ? 'Editar horario' : 'Configurar horario →'}
          </a>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {resumen.map(({ label, valor }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{valor}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Sin horario configurado */}
      {!tieneHorario && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-6">
          Este empleado no tiene horario configurado — no se pueden calcular extras ni déficits.{' '}
          <a href={`/app/${slug}/admin/empleados/${id}/horario`} className="underline font-medium">Configurar ahora</a>
        </div>
      )}

      {/* Listado por semana */}
      {semanas.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center shadow-sm">
          <p className="text-gray-400">Sin fichajes en los últimos dos meses.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {semanas.map(([lunesStr, entradasSemana]) => {
            const lunes   = new Date(lunesStr)
            const domingo = new Date(lunes)
            domingo.setDate(lunes.getDate() + 6)
            const labelSemana = `${lunes.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${domingo.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
            const minTotalSemana = calcMinutos(entradasSemana, nowStr)

            const porDia = entradasSemana.reduce((acc, e) => {
              if (!acc[e.date]) acc[e.date] = []
              acc[e.date].push(e)
              return acc
            }, {})
            const dias = Object.entries(porDia).sort(([a], [b]) => b.localeCompare(a))

            return (
              <div key={lunesStr}>
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2 flex items-center justify-between shadow-sm">
                  <p className="font-semibold text-gray-700 text-sm">{labelSemana}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatHoras(minTotalSemana)}</p>
                </div>

                <div className="space-y-2">
                  {dias.map(([dia, fichajesDia]) => {
                    const minDia      = calcMinutos(fichajesDia, nowStr)
                    const contratados = contratadosParaDia(dia)
                    const extra       = contratados > 0 ? minDia - contratados : null
                    const diferencia  = extra !== null ? formatDiferencia(extra) : null
                    const labelDia    = new Date(dia).toLocaleDateString('es-ES', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    }).replace(/^\w/, c => c.toUpperCase())

                    return (
                      <div key={dia} className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-800">{labelDia}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{formatHoras(minDia)}</p>
                            {diferencia && (
                              <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${
                                extra > 0
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {diferencia}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {fichajesDia.map((e) => (
                            <div key={e.id} className="flex items-center justify-between text-xs text-gray-400">
                              <span>
                                {formatHora(e.clock_in)} → {e.clock_out ? formatHora(e.clock_out) : <span className="text-green-600 font-medium">En curso</span>}
                              </span>
                              <span className="text-gray-600 font-medium">
                                {formatHoras(minutosEntreFechas(e.clock_in, e.clock_out ?? nowStr))}
                              </span>
                            </div>
                          ))}
                          {contratados > 0 && (
                            <p className="text-xs text-gray-300 pt-1">Jornada: {formatHoras(contratados)}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
