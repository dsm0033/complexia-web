import { getAdminPageCtx } from '@/lib/admin-context'
import { esReservaAbandonada } from '@/lib/bookings'
import {
  timeToMin, isoLocal, espDayOf, diasSemana, celdasMes, shapeEvento, repartirColumnas, calcularEje,
} from '@/lib/agenda'
import { CalendarClock } from 'lucide-react'
import VistaNav from './_components/VistaNav'
import AgendaDia from './_components/AgendaDia'
import AgendaSemana from './_components/AgendaSemana'
import AgendaMes from './_components/AgendaMes'

export const metadata = { title: 'Agenda · Admin IMPECABLE' }

const VISTAS = ['dia', 'semana', 'mes']
const hoyISO = () => isoLocal(new Date())
const pausaDe = h =>
  h?.lunch_break_start && h?.lunch_break_end
    ? { inicio: timeToMin(h.lunch_break_start), fin: timeToMin(h.lunch_break_end) }
    : null

function rangoSemanaLabel(dias) {
  const a = new Date(dias[0] + 'T12:00:00')
  const b = new Date(dias[6] + 'T12:00:00')
  const mes = d => d.toLocaleDateString('es-ES', { month: 'long' })
  const mesCorto = d => d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${mes(b)} ${b.getFullYear()}`
  return `${a.getDate()} ${mesCorto(a)} – ${b.getDate()} ${mesCorto(b)} ${b.getFullYear()}`
}

export default async function AgendaPage({ searchParams }) {
  const params = await searchParams
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params?.date ?? '') ? params.date : hoyISO()
  const vista = VISTAS.includes(params?.vista) ? params.vista : 'dia'
  const hoy = hoyISO()

  const { supabase, businessId } = await getAdminPageCtx()

  // Rango de fechas a consultar según la vista
  let desde, hasta
  if (vista === 'semana') {
    const dias = diasSemana(date)
    desde = dias[0]; hasta = dias[6]
  } else if (vista === 'mes') {
    const celdas = celdasMes(date)
    desde = celdas[0]; hasta = celdas[celdas.length - 1]
  } else {
    desde = date; hasta = date
  }

  const [{ data: bookings }, { data: horarios }, { data: settings }, { data: registros }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, date, time_slot, customer_name, license_plate, status, created_at, services(name, duration_minutes)')
      .eq('business_id', businessId)
      .gte('date', desde)
      .lte('date', hasta)
      .order('time_slot'),
    supabase
      .from('business_hours')
      .select('day_of_week, is_open, open_time, close_time, lunch_break_start, lunch_break_end')
      .eq('business_id', businessId),
    supabase
      .from('business_settings')
      .select('slot_duration_minutes')
      .eq('business_id', businessId)
      .maybeSingle(),
    supabase
      .from('service_records')
      .select('booking_id, employees(full_name)')
      .eq('business_id', businessId)
      .gte('date', desde)
      .lte('date', hasta)
      .not('booking_id', 'is', null),
  ])

  const slotDur = settings?.slot_duration_minutes ?? 60
  const horarioPorDow = Object.fromEntries((horarios ?? []).map(h => [h.day_of_week, h]))
  const empleadoPorBooking = Object.fromEntries(
    (registros ?? []).filter(r => r.employees?.full_name).map(r => [r.booking_id, r.employees.full_name])
  )

  // Trabajo real: fuera canceladas y carritos abandonados (criterio único, lib/bookings)
  const visibles = (bookings ?? []).filter(b => b.status !== 'cancelado' && !esReservaAbandonada(b))

  // Eventos agrupados por día, con reparto de columnas POR DÍA
  const eventosPorDia = {}
  for (const b of visibles) {
    const ev = shapeEvento(b, { slotDur, empleado: empleadoPorBooking[b.id] ?? null })
    ;(eventosPorDia[b.date] ??= []).push(ev)
  }
  for (const k of Object.keys(eventosPorDia)) eventosPorDia[k] = repartirColumnas(eventosPorDia[k])

  // ── Cabecera dinámica ──
  let subtitulo, totalTrabajos
  if (vista === 'semana') {
    const dias = diasSemana(date)
    subtitulo = rangoSemanaLabel(dias)
    totalTrabajos = dias.reduce((n, d) => n + (eventosPorDia[d]?.length ?? 0), 0)
  } else if (vista === 'mes') {
    subtitulo = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    const mesActual = new Date(date + 'T12:00:00').getMonth()
    totalTrabajos = visibles.filter(b => new Date(b.date + 'T12:00:00').getMonth() === mesActual).length
  } else {
    subtitulo = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    totalTrabajos = eventosPorDia[date]?.length ?? 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 mt-1 first-letter:uppercase">
            {subtitulo} · {totalTrabajos} {totalTrabajos === 1 ? 'trabajo' : 'trabajos'}
          </p>
        </div>
        <VistaNav date={date} vista={vista} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
        {vista === 'dia' && (() => {
          const eventos = eventosPorDia[date] ?? []
          const horario = horarioPorDow[espDayOf(date)]
          const abierto = horario?.is_open && horario?.open_time && horario?.close_time
          const { ejeInicio, ejeFin } = calcularEje(eventos, [horario])
          return (
            <>
              {!abierto && (
                <div className="mb-4 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2">
                  El negocio está cerrado este día según el horario configurado.
                </div>
              )}
              {eventos.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <CalendarClock size={32} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-lg font-medium">Sin trabajos para este día</p>
                  <p className="text-sm mt-1">Las reservas del día aparecen aquí en su franja horaria</p>
                </div>
              ) : (
                <AgendaDia eventos={eventos} ejeInicio={ejeInicio} ejeFin={ejeFin} pausa={pausaDe(horario)} />
              )}
            </>
          )
        })()}

        {vista === 'semana' && (() => {
          const dias = diasSemana(date)
          const eventosSemana = dias.flatMap(d => eventosPorDia[d] ?? [])
          const horariosSem = dias.map(d => horarioPorDow[espDayOf(d)])
          const { ejeInicio, ejeFin } = calcularEje(eventosSemana, horariosSem)
          const diasData = dias.map(d => {
            const dd = new Date(d + 'T12:00:00')
            return {
              date: d,
              nombreCorto: dd.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
              numero: dd.getDate(),
              esHoy: d === hoy,
              eventos: eventosPorDia[d] ?? [],
              pausa: pausaDe(horarioPorDow[espDayOf(d)]),
            }
          })
          return <AgendaSemana dias={diasData} ejeInicio={ejeInicio} ejeFin={ejeFin} />
        })()}

        {vista === 'mes' && (() => {
          const celdas = celdasMes(date)
          const mesActual = new Date(date + 'T12:00:00').getMonth()
          const celdasData = celdas.map(d => {
            const dd = new Date(d + 'T12:00:00')
            return {
              date: d,
              numero: dd.getDate(),
              enMes: dd.getMonth() === mesActual,
              esHoy: d === hoy,
              eventos: (eventosPorDia[d] ?? []).slice().sort((a, b) => a.inicio - b.inicio),
            }
          })
          return <AgendaMes celdas={celdasData} />
        })()}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Pagado online</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /> Pago en local</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Pendiente de pago</span>
      </div>
    </div>
  )
}
