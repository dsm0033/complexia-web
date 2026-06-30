'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { enviarEmailVacacion } from '@/lib/email'
import { trabajosAsignadosEnRango } from '@/lib/vacaciones'

async function getAdminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()
  return { supabase, businessId: profile?.business_id }
}

export async function guardarConfigVacaciones(prevState, formData) {
  const { supabase, businessId } = await getAdminContext()
  const max_concurrent_vacations  = parseInt(formData.get('max_concurrent_vacations') || '1')
  const min_vacation_notice_days  = parseInt(formData.get('min_vacation_notice_days') || '30')

  const { error } = await supabase
    .from('business_settings')
    .update({ max_concurrent_vacations, min_vacation_notice_days })
    .eq('business_id', businessId)

  if (error) return { error: 'No se pudo guardar la configuración.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/vacaciones`)
  return { ok: true }
}

export async function añadirBlackout(prevState, formData) {
  const { supabase, businessId } = await getAdminContext()
  const start_date = formData.get('start_date')
  const end_date   = formData.get('end_date')
  const reason     = formData.get('reason')?.trim()

  if (!start_date || !end_date || !reason) return { error: 'Todos los campos son obligatorios.' }
  if (end_date < start_date) return { error: 'La fecha de fin debe ser posterior al inicio.' }

  const { error } = await supabase
    .from('vacation_blackouts')
    .insert({ business_id: businessId, start_date, end_date, reason })

  if (error) return { error: 'No se pudo añadir el período bloqueado.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/vacaciones`)
  return { ok: true }
}

export async function eliminarBlackout(blackoutId, prevState) {
  const { supabase, businessId } = await getAdminContext()

  const { error } = await supabase
    .from('vacation_blackouts')
    .delete()
    .eq('id', blackoutId)
    .eq('business_id', businessId)

  if (error) return { error: 'No se pudo eliminar.' }
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/vacaciones`)
  return { ok: true }
}

export async function aprobarSolicitudConfig(requestId, prevState, formData) {
  const { supabase, businessId } = await getAdminContext()
  const admin_notes = formData.get('admin_notes') || null

  const { data: sol } = await supabase
    .from('vacation_requests')
    .select('employee_id, start_date, end_date')
    .eq('id', requestId)
    .eq('business_id', businessId)
    .single()
  if (!sol) return { error: 'Solicitud no encontrada.' }

  const n = await trabajosAsignadosEnRango(supabase, sol.employee_id, sol.start_date, sol.end_date)
  if (n > 0) {
    return { error: `No se puede aprobar: el empleado tiene ${n} trabajo${n !== 1 ? 's' : ''} asignado${n !== 1 ? 's' : ''} en esas fechas. Reasígnalos antes de aprobar la vacación.` }
  }

  const { error } = await supabase
    .from('vacation_requests')
    .update({ status: 'aprobada', admin_notes, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('business_id', businessId)

  if (error) return { error: 'No se pudo aprobar la solicitud.' }
  enviarEmailVacacion({ supabase, businessId, requestId, status: 'aprobada', adminNotes: admin_notes }).catch(() => {})
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/vacaciones`)
  return { ok: true }
}

export async function rechazarSolicitudConfig(requestId, prevState, formData) {
  const { supabase, businessId } = await getAdminContext()
  const admin_notes = formData.get('admin_notes') || null

  const { error } = await supabase
    .from('vacation_requests')
    .update({ status: 'rechazada', admin_notes, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('business_id', businessId)

  if (error) return { error: 'No se pudo rechazar la solicitud.' }
  enviarEmailVacacion({ supabase, businessId, requestId, status: 'rechazada', adminNotes: admin_notes }).catch(() => {})
  revalidatePath(`/app/${ctx.slug}/admin/configuracion/vacaciones`)
  return { ok: true }
}
