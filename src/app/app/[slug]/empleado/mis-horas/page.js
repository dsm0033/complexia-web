import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import {
  startOfWeek, calcMinutos, formatHoras, formatDiferencia,
  formatHora, minutosEntreFechas, jsDayToEs, agruparPorSemana,
} from '@/lib/horas'

export const metadata = { title: 'Mis horas · IMPECABLE' }

export default async function MisHorasPage({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employee } = await supabase
    .from('employees')
    .select('id, full_name')
    .eq('email', user.email)
    .single()
  if (!employee) redirect(`/app/${slug}/empleado`)

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const semanaInicio = startOfWeek(now).toISOString().split('T')[0]
  const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const historialInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]

  const [{ data: entradas }, { data: schedules }] = await Promise.all([
    supabase
      .from('time_entries')
      .select('id, date, clock_in, clock_out, notes')
      .eq('employee_id', employee.id)
      .gte('date', historialInicio)
      .order('date', { ascending: false })
      .order('clock_in', { ascending: false }),
    supabase
      .from('employee_schedules')
      .select('day_of_week, contracted_minutes')
      .eq('employee_id', employee.id)
      .is('effective_until', null),
  ])

  const todas = entradas ?? []
  const nowStr = now.toISOString()

  // Mapa day_of_week (0=lun) → minutos contratados
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

  const resumen = [
    { label: 'Hoy',        valor: formatHoras(minHoy) },
    { label: 'Esta semana', valor: formatHoras(minSemana) },
    { label: 'Este mes',   valor: formatHoras(minMes) },
  ]

  return (
    <main className="min-h-screen bg-fondo text-texto">
      <header className="bg-tarjeta border-b border-borde px-4 py-4 flex items-center gap-4">
        <Link href={`/app/${slug}/empleado`} className="text-muted hover:text-dorado transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs text-dorado font-medium uppercase tracking-wider">IMPECABLE</p>
          <h1 className="font-bold text-lg">Mis horas</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-3 gap-3">
          {resumen.map(({ label, valor }) => (
            <div key={label} className="bg-tarjeta border border-borde rounded-xl px-4 py-4 text-center">
              <p className="text-xl font-bold text-dorado">{valor}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Listado por semana */}
        {semanas.length === 0 ? (
          <div className="bg-tarjeta border border-borde rounded-xl p-10 text-center">
            <Clock size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted">Aún no tienes fichajes registrados.</p>
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
                  <div className="bg-tarjeta border border-borde rounded-xl px-4 py-3 mb-2 flex items-center justify-between">
                    <p className="font-semibold text-dorado text-sm">{labelSemana}</p>
                    <p className="text-sm font-semibold text-dorado">{formatHoras(minTotalSemana)}</p>
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
                        <div key={dia} className="bg-tarjeta border border-borde rounded-xl px-4 py-3">
                          {/* Cabecera del día */}
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-texto">{labelDia}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-dorado">{formatHoras(minDia)}</p>
                              {diferencia && (
                                <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${
                                  extra > 0
                                    ? 'bg-green-500/15 text-green-400'
                                    : 'bg-red-500/15 text-red-400'
                                }`}>
                                  {diferencia}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Fichajes del día */}
                          <div className="space-y-1">
                            {fichajesDia.map((e) => (
                              <div key={e.id} className="flex items-center justify-between text-xs text-muted">
                                <span>
                                  {formatHora(e.clock_in)} → {e.clock_out ? formatHora(e.clock_out) : 'En curso'}
                                </span>
                                <span className="text-dorado">
                                  {formatHoras(minutosEntreFechas(e.clock_in, e.clock_out ?? nowStr))}
                                </span>
                              </div>
                            ))}
                            {contratados > 0 && (
                              <p className="text-xs text-muted/50 pt-1">
                                Jornada contratada: {formatHoras(contratados)}
                              </p>
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
    </main>
  )
}
