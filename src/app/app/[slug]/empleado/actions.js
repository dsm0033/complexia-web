'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getEmpleadoCtx() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: employee } = await supabase
    .from('employees')
    .select('id, business_id, businesses(slug)')
    .eq('email', user.email)
    .single()
  if (!employee) return null
  return {
    supabase,
    employeeId: employee.id,
    businessId: employee.business_id,
    slug: employee.businesses?.slug ?? null,
  }
}

export async function actualizarProgreso(recordId, progress) {
  const ctx = await getEmpleadoCtx()
  if (!ctx) return { error: 'No autenticado' }

  await ctx.supabase
    .from('service_records')
    .update({ checklist_progress: progress })
    .eq('id', recordId)
    .eq('employee_id', ctx.employeeId)
}

export async function iniciarTrabajo(recordId) {
  const ctx = await getEmpleadoCtx()
  if (!ctx) return { error: 'No autenticado' }

  const { data: record } = await ctx.supabase
    .from('service_records')
    .select('started_at')
    .eq('id', recordId)
    .eq('employee_id', ctx.employeeId)
    .single()

  if (record && !record.started_at) {
    await ctx.supabase
      .from('service_records')
      .update({ started_at: new Date().toISOString() })
      .eq('id', recordId)
      .eq('employee_id', ctx.employeeId)
  }
}

export async function completarTrabajo(recordId) {
  const ctx = await getEmpleadoCtx()
  if (!ctx) return { error: 'No autenticado' }

  await ctx.supabase
    .from('service_records')
    .update({ status: 'completado', completed_at: new Date().toISOString() })
    .eq('id', recordId)
    .eq('employee_id', ctx.employeeId)

  revalidatePath(`/app/${ctx.slug}/empleado`)
}

export async function ficharEntrada() {
  const ctx = await getEmpleadoCtx()
  if (!ctx) return { error: 'No autenticado' }

  const today = new Date().toISOString().split('T')[0]

  // Evitar doble fichaje abierto en el mismo día
  const { data: abierto } = await ctx.supabase
    .from('time_entries')
    .select('id')
    .eq('employee_id', ctx.employeeId)
    .eq('date', today)
    .is('clock_out', null)
    .maybeSingle()

  if (abierto) return { error: 'Ya estás fichado' }

  await ctx.supabase.from('time_entries').insert({
    employee_id: ctx.employeeId,
    business_id: ctx.businessId,
    clock_in: new Date().toISOString(),
    date: today,
  })

  revalidatePath(`/app/${ctx.slug}/empleado`)
}

export async function actualizarIban(prevState, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const raw = formData.get('iban')?.trim().toUpperCase().replace(/\s/g, '') || null
  if (raw && !/^ES\d{22}$/.test(raw))
    return { error: 'IBAN no válido. Debe empezar por ES seguido de 22 dígitos.' }

  // RPC SECURITY DEFINER: solo deja al empleado actualizar el campo iban de
  // su propia fila. Evita exponer un UPDATE general que tocaría salario, role…
  const { error } = await supabase.rpc('actualizar_iban_empleado', { p_iban: raw })

  if (error) {
    if (error.message?.includes('employee_not_found')) return { error: 'Empleado no encontrado' }
    if (error.message?.includes('invalid_iban_format')) return { error: 'IBAN no válido.' }
    return { error: error.message }
  }

  const { data: employee } = await supabase
    .from('employees')
    .select('businesses(slug)')
    .eq('email', user.email)
    .single()
  const slug = employee?.businesses?.slug ?? null
  if (slug) revalidatePath(`/app/${slug}/empleado`)

  return { ok: true }
}

export async function ficharSalida() {
  const ctx = await getEmpleadoCtx()
  if (!ctx) return { error: 'No autenticado' }

  const today = new Date().toISOString().split('T')[0]

  const { data: abierto } = await ctx.supabase
    .from('time_entries')
    .select('id')
    .eq('employee_id', ctx.employeeId)
    .eq('date', today)
    .is('clock_out', null)
    .maybeSingle()

  if (!abierto) return { error: 'No estás fichado' }

  await ctx.supabase
    .from('time_entries')
    .update({ clock_out: new Date().toISOString() })
    .eq('id', abierto.id)

  revalidatePath(`/app/${ctx.slug}/empleado`)
  revalidatePath(`/app/${ctx.slug}/empleado/mis-horas`)
}
