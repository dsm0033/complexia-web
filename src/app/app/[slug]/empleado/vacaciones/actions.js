'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getEmployeeContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: employee } = await supabase
    .from('employees')
    .select('id, business_id, businesses(slug)')
    .eq('email', user.email)
    .single()
  return { supabase, employee, slug: employee?.businesses?.slug ?? null }
}

function countWorkingDays(start, end) {
  let count = 0
  const cur = new Date(start)
  const fin = new Date(end)
  while (cur <= fin) {
    const dow = cur.getDay()
    if (dow !== 0 && dow !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export async function solicitarVacaciones(prevState, formData) {
  const { supabase, employee, slug } = await getEmployeeContext()
  if (!employee) return { error: 'Empleado no encontrado.' }

  const start_date = formData.get('start_date')
  const end_date   = formData.get('end_date')

  if (!start_date || !end_date) return { error: 'Selecciona un rango de fechas.' }
  if (end_date < start_date)    return { error: 'La fecha de fin debe ser posterior al inicio.' }

  const today = new Date().toISOString().split('T')[0]
  if (start_date <= today) return { error: 'Las vacaciones deben solicitarse para fechas futuras.' }

  // Verificar antelación mínima
  const { data: settings } = await supabase
    .from('business_settings')
    .select('min_vacation_notice_days')
    .eq('business_id', employee.business_id)
    .maybeSingle()

  const noticeDays = settings?.min_vacation_notice_days ?? 30
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + noticeDays)
  const minDateStr = minDate.toISOString().split('T')[0]

  if (start_date < minDateStr) {
    return { error: `Debes solicitar las vacaciones con al menos ${noticeDays} días de antelación (Art. 38 ET).` }
  }

  // Verificar blackouts
  const { data: blackouts } = await supabase
    .from('vacation_blackouts')
    .select('reason, start_date, end_date')
    .eq('business_id', employee.business_id)
    .lte('start_date', end_date)
    .gte('end_date', start_date)

  if (blackouts?.length) {
    return { error: `Período no disponible para vacaciones: ${blackouts[0].reason}.` }
  }

  const working_days = countWorkingDays(start_date, end_date)
  if (working_days === 0) return { error: 'El rango seleccionado no incluye días laborables.' }

  // Verificar días disponibles
  const year = new Date(start_date).getFullYear()
  const { data: entitlement } = await supabase
    .from('vacation_entitlements')
    .select('total_days, carryover_days')
    .eq('employee_id', employee.id)
    .eq('year', year)
    .maybeSingle()

  const totalDays = (entitlement?.total_days ?? 22) + (entitlement?.carryover_days ?? 0)

  const { data: approved } = await supabase
    .from('vacation_requests')
    .select('working_days')
    .eq('employee_id', employee.id)
    .eq('status', 'aprobada')
    .gte('start_date', `${year}-01-01`)
    .lte('end_date',   `${year}-12-31`)

  const usedDays = (approved ?? []).reduce((s, r) => s + r.working_days, 0)

  if (usedDays + working_days > totalDays) {
    return { error: `No tienes suficientes días. Disponibles: ${totalDays - usedDays}, solicitados: ${working_days}.` }
  }

  const { error } = await supabase
    .from('vacation_requests')
    .insert({
      employee_id:  employee.id,
      business_id:  employee.business_id,
      start_date,
      end_date,
      working_days,
      status: 'pendiente',
    })

  if (error) return { error: 'No se pudo enviar la solicitud.' }
  if (slug) revalidatePath(`/app/${slug}/empleado/vacaciones`)
  return { ok: true, working_days }
}

export async function cancelarSolicitud(requestId, prevState) {
  const { supabase, employee, slug } = await getEmployeeContext()
  if (!employee) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('vacation_requests')
    .update({ status: 'cancelada', updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('employee_id', employee.id)
    .eq('status', 'pendiente')

  if (error) return { error: 'No se pudo cancelar la solicitud.' }
  if (slug) revalidatePath(`/app/${slug}/empleado/vacaciones`)
  return { ok: true }
}
