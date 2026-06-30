'use server'

import { revalidatePath } from 'next/cache'
import { getAdminCtx } from '@/lib/admin-context'
import { esReservaActiva } from '@/lib/bookings'

// ─────────────────────────────────────────────
// Guarda el horario semanal del negocio (7 días)
// ─────────────────────────────────────────────
export async function guardarHorarioNegocio(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  const rows = Array.from({ length: 7 }, (_, i) => {
    const isOpen     = formData.get(`day_${i}_is_open`) === 'on'
    const openTime   = formData.get(`day_${i}_open_time`)   || '09:00'
    const closeTime  = formData.get(`day_${i}_close_time`)  || '18:00'
    const lunchStart = formData.get(`day_${i}_lunch_start`) || null
    const lunchEnd   = formData.get(`day_${i}_lunch_end`)   || null
    return {
      business_id:       businessId,
      day_of_week:       i,
      is_open:           isOpen,
      open_time:         openTime,
      close_time:        closeTime,
      lunch_break_start: lunchStart || null,
      lunch_break_end:   lunchEnd   || null,
    }
  })

  const { error } = await supabase
    .from('business_hours')
    .upsert(rows, { onConflict: 'business_id,day_of_week' })

  if (error) return { error: 'Error al guardar el horario.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/reservas`)
  return { ok: true }
}

// ─────────────────────────────────────────────
// Guarda la configuración general de reservas
// ─────────────────────────────────────────────
export async function guardarConfiguracion(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  const slotDuration  = parseInt(formData.get('slot_duration_minutes'))
  const maxConcurrent = parseInt(formData.get('max_concurrent_bookings'))
  const advanceDays   = parseInt(formData.get('booking_advance_days'))
  const noticeHours   = parseInt(formData.get('min_booking_notice_hours'))

  if (isNaN(slotDuration) || slotDuration < 15 || slotDuration > 480)
    return { error: 'Duración de slot inválida (15-480 min).' }
  if (isNaN(maxConcurrent) || maxConcurrent < 1 || maxConcurrent > 20)
    return { error: 'Capacidad simultánea inválida (1-20).' }
  if (isNaN(advanceDays) || advanceDays < 1 || advanceDays > 365)
    return { error: 'Días de antelación inválido (1-365).' }
  if (isNaN(noticeHours) || noticeHours < 1 || noticeHours > 168)
    return { error: 'Aviso mínimo inválido (1-168 horas).' }

  const { error } = await supabase
    .from('business_settings')
    .upsert({
      business_id:               businessId,
      slot_duration_minutes:     slotDuration,
      max_concurrent_bookings:   maxConcurrent,
      booking_advance_days:      advanceDays,
      min_booking_notice_hours:  noticeHours,
      updated_at:                new Date().toISOString(),
    }, { onConflict: 'business_id' })

  if (error) return { error: 'Error al guardar la configuración.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/reservas`)
  return { ok: true }
}

// ─────────────────────────────────────────────
// Guarda el descuento por pago adelantado
// ─────────────────────────────────────────────
export async function guardarDescuento(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  const raw      = formData.get('advance_payment_discount')
  const discount = raw === '' ? null : parseInt(raw)

  if (discount !== null && (isNaN(discount) || discount < 0 || discount > 100))
    return { error: 'El descuento debe estar entre 0 y 100.' }

  const { error } = await supabase
    .from('business_settings')
    .upsert({
      business_id:              businessId,
      advance_payment_discount: discount,
      updated_at:               new Date().toISOString(),
    }, { onConflict: 'business_id' })

  if (error) return { error: 'Error al guardar el descuento.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/reservas`)
  return { ok: true }
}

// ─────────────────────────────────────────────
// Guarda el descuento por pago en efectivo
// ─────────────────────────────────────────────
export async function guardarDescuentoEfectivo(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  const raw      = formData.get('cash_payment_discount')
  const discount = raw === '' ? null : parseInt(raw)

  if (discount !== null && (isNaN(discount) || discount < 0 || discount > 100))
    return { error: 'El descuento debe estar entre 0 y 100.' }

  const { error } = await supabase
    .from('business_settings')
    .upsert({
      business_id:           businessId,
      cash_payment_discount: discount,
      updated_at:            new Date().toISOString(),
    }, { onConflict: 'business_id' })

  if (error) return { error: 'Error al guardar el descuento.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/reservas`)
  return { ok: true }
}

// ─────────────────────────────────────────────
// Activa/desactiva festivos nacionales y guarda la comunidad autónoma
// ─────────────────────────────────────────────
export async function guardarOpcionesFestivos(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  const useHolidays  = formData.get('use_national_holidays') === 'on'
  const region       = formData.get('holiday_region') || null

  const { error } = await supabase
    .from('business_settings')
    .upsert({
      business_id:           businessId,
      use_national_holidays: useHolidays,
      holiday_region:        region,
      updated_at:            new Date().toISOString(),
    }, { onConflict: 'business_id' })

  if (error) return { error: 'Error al guardar las opciones.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/reservas`)
  return { ok: true }
}

// ─────────────────────────────────────────────
// Importa festivos de Nager.Date para un año dado
// Borra primero los festivos importados de ese año para ese negocio,
// luego inserta los nuevos (sin tocar los bloqueados manualmente)
// ─────────────────────────────────────────────
export async function importarFestivos(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  const year   = parseInt(formData.get('year'))
  const region = formData.get('region') || null

  if (isNaN(year) || year < 2024 || year > 2030)
    return { error: 'Año inválido.' }

  // Llamar a Nager.Date API
  let holidays
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ES`, {
      next: { revalidate: 86400 }, // cachear 24h
    })
    if (!res.ok) throw new Error('API error')
    holidays = await res.json()
  } catch {
    return { error: 'No se pudo conectar con el calendario de festivos. Inténtalo más tarde.' }
  }

  // Filtrar: nacionales (counties null) + de la comunidad seleccionada si hay
  const isRelevant = (h) => {
    if (!h.counties) return true
    if (!region) return false
    return h.counties.some(c => c === region || c === `ES-${region}` || c.endsWith(`-${region}`))
  }

  const toInsert = holidays
    .filter(isRelevant)
    .map(h => ({
      business_id: businessId,
      date:        h.date,
      reason:      h.localName,
      source:      h.counties ? 'regional_holiday' : 'national_holiday',
    }))

  if (!toInsert.length) return { error: 'No se encontraron festivos para el período seleccionado.' }

  // Borrar festivos importados previos de ese año (no los manuales)
  await supabase
    .from('blocked_dates')
    .delete()
    .eq('business_id', businessId)
    .in('source', ['national_holiday', 'regional_holiday'])
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)

  // Insertar los nuevos (DO NOTHING si un manual ya ocupa esa fecha)
  const { error } = await supabase
    .from('blocked_dates')
    .upsert(toInsert, { onConflict: 'business_id,date', ignoreDuplicates: true })

  if (error) return { error: 'Error al guardar los festivos.' }

  revalidatePath(`/app/${ctx.slug}/admin/configuracion/reservas`)
  return { ok: true, count: toInsert.length }
}

// ─────────────────────────────────────────────
// Bloquea una fecha manualmente
// ─────────────────────────────────────────────
export async function bloquearFecha(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  const date   = formData.get('date')
  const reason = formData.get('reason')?.trim() || null

  if (!date) return { error: 'Selecciona una fecha.' }

  // Verificar si hay reservas activas en esa fecha. Excluimos las canceladas
  // y los carritos de pago abandonados (pendientes que ya superaron la ventana),
  // igual que hace el panel de reservas — ver esReservaActiva en @/lib/bookings.
  const { data: reservas, error: checkError } = await supabase
    .from('bookings')
    .select('id, status, created_at')
    .eq('business_id', businessId)
    .eq('date', date)
    .neq('status', 'cancelado')

  if (checkError) return { error: 'Error al verificar las reservas existentes.' }

  const activas = (reservas ?? []).filter(r => esReservaActiva(r))

  if (activas.length > 0) {
    const n = activas.length
    return {
      error: `No se puede bloquear el ${date}: hay ${n} reserva${n > 1 ? 's' : ''} activa${n > 1 ? 's' : ''} ese día. Cancélalas primero desde el panel de reservas.`,
    }
  }

  const { error } = await supabase
    .from('blocked_dates')
    .upsert({ business_id: businessId, date, reason, source: 'manual' }, { onConflict: 'business_id,date' })

  if (error) return { error: 'Error al bloquear la fecha.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/reservas`)
  return { ok: true }
}

// ─────────────────────────────────────────────
// Desbloquea una fecha (elimina el registro)
// ─────────────────────────────────────────────
export async function desbloquearFecha(prevState, formData) {
  const id = formData.get('id')
  if (!id) return { error: 'ID no especificado.' }

  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) return { error: 'Error al desbloquear la fecha.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/reservas`)
  return { ok: true }
}
