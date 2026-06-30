'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAdminCtx } from '@/lib/admin-context'

export async function toggleServicio(id, active) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }
  await ctx.supabase
    .from('services')
    .update({ active: !active })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  revalidatePath(`/app/${ctx.slug}/admin/servicios`)
  revalidatePath(`/app/${ctx.slug}`)
}

const VEHICLE_KEYS = ['turismo_pequeno', 'turismo', 'suv', 'furgoneta', 'caravana']

function buildVehiclePricing(formData) {
  const pricing = {}
  for (const key of VEHICLE_KEYS) {
    const raw = formData.get(`vp_${key}`)
    if (raw !== null && raw !== '') {
      const val = parseFloat(raw)
      if (!isNaN(val) && val > 0) pricing[key] = val
    }
  }
  return pricing
}

function minPrice(pricing) {
  const vals = Object.values(pricing).filter(v => typeof v === 'number' && v > 0)
  return vals.length ? Math.min(...vals) : null
}

export async function crearServicio(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const name = formData.get('name')?.trim()
  if (!name) return { error: 'El nombre es obligatorio' }

  const duration_minutes = formData.get('duration_minutes')
  const vehicle_pricing = buildVehiclePricing(formData)
  const price = minPrice(vehicle_pricing)

  const { error } = await ctx.supabase.from('services').insert({
    business_id: ctx.businessId,
    name,
    description: formData.get('description')?.trim() || null,
    price,
    vehicle_pricing,
    duration_minutes: duration_minutes ? parseInt(duration_minutes) : null,
    icon: formData.get('icon') || 'Wrench',
    highlight: formData.get('highlight') === 'on',
    checklist_id: formData.get('checklist_id') || null,
    active: true,
  })

  if (error) return { error: error.message }

  revalidatePath(`/app/${ctx.slug}/admin/servicios`)
  revalidatePath(`/app/${ctx.slug}`)
  redirect(`/app/${ctx.slug}/admin/servicios`)
}

export async function editarServicio(id, prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const name = formData.get('name')?.trim()
  if (!name) return { error: 'El nombre es obligatorio' }

  const duration_minutes = formData.get('duration_minutes')
  const vehicle_pricing = buildVehiclePricing(formData)
  const price = minPrice(vehicle_pricing)

  const { error } = await ctx.supabase
    .from('services')
    .update({
      name,
      description: formData.get('description')?.trim() || null,
      price,
      vehicle_pricing,
      duration_minutes: duration_minutes ? parseInt(duration_minutes) : null,
      icon: formData.get('icon') || 'Wrench',
      highlight: formData.get('highlight') === 'on',
      checklist_id: formData.get('checklist_id') || null,
    })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) return { error: error.message }

  revalidatePath(`/app/${ctx.slug}/admin/servicios`)
  revalidatePath(`/app/${ctx.slug}`)
  redirect(`/app/${ctx.slug}/admin/servicios`)
}

export async function moverServicio(id, direction) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const { data: servicios } = await ctx.supabase
    .from('services')
    .select('id, sort_order')
    .eq('business_id', ctx.businessId)
    .order('sort_order')

  const idx = servicios?.findIndex((s) => s.id === id)
  if (idx === -1 || idx == null) return

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= servicios.length) return

  const current = servicios[idx]
  const swap = servicios[swapIdx]

  await Promise.all([
    ctx.supabase.from('services').update({ sort_order: swap.sort_order }).eq('id', current.id),
    ctx.supabase.from('services').update({ sort_order: current.sort_order }).eq('id', swap.id),
  ])

  revalidatePath(`/app/${ctx.slug}/admin/servicios`)
  revalidatePath(`/app/${ctx.slug}`)
}

export async function eliminarServicio(id) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  await ctx.supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  revalidatePath(`/app/${ctx.slug}/admin/servicios`)
  revalidatePath(`/app/${ctx.slug}`)
}
