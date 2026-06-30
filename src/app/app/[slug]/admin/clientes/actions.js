'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAdminCtx } from '@/lib/admin-context'
import { requireFields, requireOneOf } from '@/lib/validation'

export async function crearCliente(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const err = requireFields(formData, { full_name: 'El nombre es obligatorio' })
    ?? requireOneOf(formData, 'email', 'phone', 'Indica al menos un teléfono o email de contacto')
  if (err) return { error: err }

  const email = formData.get('email')?.trim() || null
  const phone = formData.get('phone')?.trim() || null

  // Si ya existe un cliente con ese email o teléfono, redirigir a su ficha
  if (email) {
    const { data: byEmail } = await ctx.supabase.from('customers').select('id').eq('email', email).eq('business_id', ctx.businessId).maybeSingle()
    if (byEmail) redirect(`/app/${ctx.slug}/admin/clientes/${byEmail.id}`)
  }
  if (phone) {
    const { data: byPhone } = await ctx.supabase.from('customers').select('id').eq('phone', phone).eq('business_id', ctx.businessId).maybeSingle()
    if (byPhone) redirect(`/app/${ctx.slug}/admin/clientes/${byPhone.id}`)
  }

  const { data: nuevo, error } = await ctx.supabase.from('customers').insert({
    business_id: ctx.businessId,
    full_name: formData.get('full_name').trim(),
    email,
    phone,
  }).select('id').single()

  if (error) return { error: 'Ya existe un cliente con ese email o teléfono.' }

  revalidatePath(`/app/${ctx.slug}/admin/clientes`)
  redirect(`/app/${ctx.slug}/admin/clientes/${nuevo.id}`)
}

export async function editarCliente(id, prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const err = requireFields(formData, { full_name: 'El nombre es obligatorio' })
    ?? requireOneOf(formData, 'email', 'phone', 'Indica al menos un teléfono o email de contacto')
  if (err) return { error: err }

  const { error } = await ctx.supabase
    .from('customers')
    .update({
      full_name: formData.get('full_name').trim(),
      email:     formData.get('email')?.trim() || null,
      phone:     formData.get('phone')?.trim() || null,
    })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) return { error: error.message }

  revalidatePath(`/app/${ctx.slug}/admin/clientes`)
  redirect(`/app/${ctx.slug}/admin/clientes`)
}

export async function eliminarCliente(id) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  await ctx.supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  revalidatePath(`/app/${ctx.slug}/admin/clientes`)
}
