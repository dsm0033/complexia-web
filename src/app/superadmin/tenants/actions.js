'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getSuperadminCtx() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'superadmin') return null
  return { supabase }
}

export async function cambiarPlan(businessId, plan) {
  const ctx = await getSuperadminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const planesValidos = ['free', 'basic', 'pro']
  if (!planesValidos.includes(plan)) return { error: 'Plan inválido' }

  const { data, error } = await ctx.supabase
    .from('businesses')
    .update({ plan })
    .eq('id', businessId)
    .select('id')

  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Tenant no encontrado' }
  revalidatePath('/superadmin/tenants')
  return { ok: true }
}

export async function toggleActivo(businessId, active) {
  const ctx = await getSuperadminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const { data, error } = await ctx.supabase
    .from('businesses')
    .update({ active })
    .eq('id', businessId)
    .select('id')

  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Tenant no encontrado' }
  revalidatePath('/superadmin/tenants')
  return { ok: true }
}
