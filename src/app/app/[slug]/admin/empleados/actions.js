'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAdminCtx } from '@/lib/admin-context'
import { requireFields, requireOneOf } from '@/lib/validation'

export async function crearEmpleado(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const err = requireFields(formData, { full_name: 'El nombre es obligatorio' })
    ?? requireOneOf(formData, 'email', 'phone', 'Indica al menos un teléfono o email de contacto')
  if (err) return { error: err }

  const { error } = await ctx.supabase.from('employees').insert({
    business_id: ctx.businessId,
    full_name: formData.get('full_name').trim(),
    email:     formData.get('email')?.trim() || null,
    phone:     formData.get('phone')?.trim() || null,
    position:  formData.get('position')?.trim() || null,
    active: true,
  })

  if (error) return { error: error.message }

  revalidatePath(`/app/${ctx.slug}/admin/empleados`)
  redirect(`/app/${ctx.slug}/admin/empleados`)
}

export async function editarEmpleado(id, prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const err = requireFields(formData, { full_name: 'El nombre es obligatorio' })
    ?? requireOneOf(formData, 'email', 'phone', 'Indica al menos un teléfono o email de contacto')
  if (err) return { error: err }

  const { error } = await ctx.supabase
    .from('employees')
    .update({
      full_name: formData.get('full_name').trim(),
      email:     formData.get('email')?.trim() || null,
      phone:     formData.get('phone')?.trim() || null,
      position:  formData.get('position')?.trim() || null,
    })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) return { error: error.message }

  revalidatePath(`/app/${ctx.slug}/admin/empleados`)
  redirect(`/app/${ctx.slug}/admin/empleados`)
}

export async function actualizarIbanAdmin(id, prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const raw = formData.get('iban')?.trim().toUpperCase().replace(/\s/g, '') || null
  if (raw && !/^ES\d{22}$/.test(raw))
    return { error: 'IBAN no válido. Debe empezar por ES seguido de 22 dígitos.' }

  const { error } = await ctx.supabase
    .from('employees')
    .update({ iban: raw })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) return { error: error.message }

  revalidatePath(`/app/${ctx.slug}/admin/empleados/${id}/editar`)
  return { ok: true }
}

export async function toggleEmpleado(id, active) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  await ctx.supabase
    .from('employees')
    .update({ active: !active })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  revalidatePath(`/app/${ctx.slug}/admin/empleados`)
}

export async function eliminarEmpleado(id) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  await ctx.supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  revalidatePath(`/app/${ctx.slug}/admin/empleados`)
}

// Guarda el horario semanal de un empleado.
// Para cada día (0=lun … 6=dom) cierra el registro activo anterior
// y crea uno nuevo con effective_from = hoy.
export async function guardarHorario(employeeId, prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const today = new Date().toISOString().split('T')[0]

  // Leer los minutos enviados por el formulario para cada día
  const dias = Array.from({ length: 7 }, (_, i) => {
    const horas = parseFloat(formData.get(`day_${i}_horas`) || '0')
    const minutes = isNaN(horas) || horas < 0 ? 0 : Math.round(horas * 60)
    return { day_of_week: i, contracted_minutes: minutes }
  })

  // Cerrar registros activos del empleado para estos días
  await ctx.supabase
    .from('employee_schedules')
    .update({ effective_until: today })
    .eq('employee_id', employeeId)
    .eq('business_id', ctx.businessId)
    .is('effective_until', null)

  // Insertar nuevo horario vigente
  const { error } = await ctx.supabase
    .from('employee_schedules')
    .insert(
      dias.map(d => ({
        ...d,
        employee_id: employeeId,
        business_id: ctx.businessId,
        effective_from: today,
        effective_until: null,
      }))
    )

  if (error) return { error: error.message }

  revalidatePath(`/app/${ctx.slug}/admin/empleados/${employeeId}/horario`)
  return { ok: true }
}
