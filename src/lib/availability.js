import { createClient } from '@supabase/supabase-js'
import { esReservaActiva } from './bookings.js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Convierte "HH:MM" o "HH:MM:SS" a minutos desde medianoche
function toMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function toTimeStr(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

// Genera todos los slots posibles para un horario dado
export function generateSlots(openTime, closeTime, lunchStart, lunchEnd, slotDuration) {
  const open   = toMinutes(openTime)
  const close  = toMinutes(closeTime)
  const lunchS = lunchStart ? toMinutes(lunchStart) : null
  const lunchE = lunchEnd   ? toMinutes(lunchEnd)   : null
  const slots  = []

  for (let t = open; t + slotDuration <= close; t += slotDuration) {
    // Descarta slots que solapan con la pausa de comida
    if (lunchS !== null && lunchE !== null && t < lunchE && (t + slotDuration) > lunchS) continue
    slots.push(toTimeStr(t))
  }
  return slots
}

// Convierte día JS (0=Dom) a convención española (0=Lun)
export function jsDayToSpanish(jsDay) {
  return (jsDay + 6) % 7
}

// Devuelve los slots disponibles para una fecha dada.
// businessId: uuid del negocio
// serviceId: uuid del servicio que se va a reservar (opcional). Si se pasa, se usa
//   su duración para descartar slots cuyo intervalo solapa con reservas existentes;
//   si no, se asume que la nueva reserva ocupa un slot (slot_duration_minutes).
// Retorna { slots, closed, blocked } donde slots es array de strings "HH:MM"
export async function getAvailableSlots(date, businessId, serviceId = null) {
  const db = adminClient()

  // ¿Fecha bloqueada?
  const { data: blocked } = await db
    .from('blocked_dates')
    .select('id')
    .eq('business_id', businessId)
    .eq('date', date)
    .maybeSingle()

  if (blocked) return { slots: [], blocked: true }

  // Día de la semana en convención española
  const dateObj  = new Date(date + 'T12:00:00')
  const dayOfWeek = jsDayToSpanish(dateObj.getDay())

  // Horario del negocio para ese día
  const { data: hours } = await db
    .from('business_hours')
    .select('is_open, open_time, close_time, lunch_break_start, lunch_break_end')
    .eq('business_id', businessId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!hours?.is_open) return { slots: [], closed: true }

  // Configuración general
  const { data: settings } = await db
    .from('business_settings')
    .select('slot_duration_minutes, max_concurrent_bookings')
    .eq('business_id', businessId)
    .single()

  const slotDuration  = settings?.slot_duration_minutes   ?? 60
  const maxConcurrent = settings?.max_concurrent_bookings ?? 1

  // Duración de la reserva que se va a crear (para calcular solapamiento real).
  // Sin serviceId asumimos que ocupa un slot.
  let newDuration = slotDuration
  if (serviceId) {
    const { data: svc } = await db
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .maybeSingle()
    newDuration = svc?.duration_minutes ?? slotDuration
  }

  const allSlots = generateSlots(
    hours.open_time.slice(0, 5),
    hours.close_time.slice(0, 5),
    hours.lunch_break_start?.slice(0, 5) ?? null,
    hours.lunch_break_end?.slice(0, 5)   ?? null,
    slotDuration
  )

  // Reservas existentes para esa fecha (con duración del servicio para calcular solapamiento).
  // Excluimos canceladas y carritos abandonados (pendientes vencidos) con el mismo
  // criterio que el resto del sistema — ver esReservaActiva en ./bookings.js.
  const { data: bookings } = await db
    .from('bookings')
    .select('time_slot, status, created_at, services(duration_minutes)')
    .eq('business_id', businessId)
    .eq('date', date)
    .neq('status', 'cancelado')

  const activas = (bookings ?? []).filter(b => esReservaActiva(b))

  // Para cada slot candidato, cuenta cuántas reservas existentes solapan con el
  // intervalo que ocuparía la nueva reserva: [slot, slot + newDuration).
  // Dos intervalos [a1,a2) y [b1,b2) solapan si a1 < b2 AND b1 < a2.
  const available = allSlots.filter(slot => {
    const newStart = toMinutes(slot)
    const newEnd   = newStart + newDuration
    const activeCount = activas.filter(b => {
      const start = toMinutes(b.time_slot.slice(0, 5))
      const end   = start + (b.services?.duration_minutes ?? slotDuration)
      return newStart < end && start < newEnd
    }).length
    return activeCount < maxConcurrent
  })

  return { slots: available }
}
