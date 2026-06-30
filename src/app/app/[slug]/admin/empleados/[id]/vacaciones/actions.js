'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { enviarEmailVacacion } from '@/lib/email'
import { trabajosAsignadosEnRango } from '@/lib/vacaciones'

const avisoTrabajos = n =>
  `No se puede aprobar: el empleado tiene ${n} trabajo${n !== 1 ? 's' : ''} asignado${n !== 1 ? 's' : ''} en esas fechas. Reasígnalos o cámbialos de fecha antes de aprobar la vacación.`

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

export async function aprobarSolicitud(requestId, prevState, formData) {
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
  if (n > 0) return { error: avisoTrabajos(n) }

  const { error } = await supabase
    .from('vacation_requests')
    .update({ status: 'aprobada', admin_notes, employee_read: false, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('business_id', businessId)

  if (error) return { error: 'No se pudo aprobar la solicitud.' }
  enviarEmailVacacion({ supabase, businessId, requestId, status: 'aprobada', adminNotes: admin_notes }).catch(() => {})
  revalidatePath(`/app/${ctx.slug}/admin/empleados/[id]/vacaciones`, 'page')
  return { ok: true }
}

export async function rechazarSolicitud(requestId, prevState, formData) {
  const { supabase, businessId } = await getAdminContext()
  const admin_notes = formData.get('admin_notes') || null

  const { error } = await supabase
    .from('vacation_requests')
    .update({ status: 'rechazada', admin_notes, employee_read: false, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('business_id', businessId)

  if (error) return { error: 'No se pudo rechazar la solicitud.' }
  enviarEmailVacacion({ supabase, businessId, requestId, status: 'rechazada', adminNotes: admin_notes }).catch(() => {})
  revalidatePath(`/app/${ctx.slug}/admin/empleados/[id]/vacaciones`, 'page')
  return { ok: true }
}

export async function crearSolicitudManual(employeeId, prevState, formData) {
  const { supabase, businessId } = await getAdminContext()

  const start_date  = formData.get('start_date')
  const end_date    = formData.get('end_date')
  const admin_notes = formData.get('admin_notes') || null

  if (!start_date || !end_date) return { error: 'Selecciona un rango de fechas.' }
  if (end_date < start_date)    return { error: 'La fecha de fin debe ser posterior al inicio.' }

  let working_days = 0
  const cur = new Date(start_date)
  const fin = new Date(end_date)
  while (cur <= fin) {
    const d = cur.getDay()
    if (d !== 0 && d !== 6) working_days++
    cur.setDate(cur.getDate() + 1)
  }
  if (working_days === 0) return { error: 'El rango no incluye días laborables.' }

  const n = await trabajosAsignadosEnRango(supabase, employeeId, start_date, end_date)
  if (n > 0) return { error: avisoTrabajos(n) }

  const { error } = await supabase
    .from('vacation_requests')
    .insert({
      employee_id:  employeeId,
      business_id:  businessId,
      start_date,
      end_date,
      working_days,
      status:       'aprobada',
      admin_notes,
    })

  if (error) return { error: 'No se pudo crear la solicitud.' }
  revalidatePath(`/app/${ctx.slug}/admin/empleados/[id]/vacaciones`, 'page')
  return { ok: true, working_days }
}

export async function actualizarEntitlement(employeeId, prevState, formData) {
  const { supabase, businessId } = await getAdminContext()
  const year          = parseInt(formData.get('year'))
  const total_days    = parseInt(formData.get('total_days'))
  const carryover_days = parseInt(formData.get('carryover_days') || '0')

  if (!year || !total_days) return { error: 'Datos incompletos.' }

  const { error } = await supabase
    .from('vacation_entitlements')
    .upsert({ employee_id: employeeId, business_id: businessId, year, total_days, carryover_days },
             { onConflict: 'employee_id,year' })

  if (error) return { error: 'No se pudo guardar.' }
  revalidatePath(`/app/${ctx.slug}/admin/empleados/[id]/vacaciones`, 'page')
  return { ok: true }
}
