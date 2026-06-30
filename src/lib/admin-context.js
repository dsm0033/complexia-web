// ─────────────────────────────────────────────────────────────────────────────
// Convención de clientes Supabase en este proyecto
// ─────────────────────────────────────────────────────────────────────────────
// 1. SSR (anon key + cookies de sesión) — `createClient` de @/lib/supabase/server
//    Por defecto en server components y server actions. Respeta RLS con la
//    identidad del usuario logueado.
//
// 2. Browser (anon key, sin cookies de servidor) — @/lib/supabase/client
//    Para componentes 'use client' que necesitan suscribirse a cambios.
//
// 3. Service role (bypasea RLS completamente) — createClient de
//    @supabase/supabase-js con SUPABASE_SERVICE_ROLE_KEY
//    SOLO en: webhooks (Stripe), cron jobs, /auth/callback, inserts públicos.
//    En cualquier otro caso usa la sesión SSR.
// ─────────────────────────────────────────────────────────────────────────────

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Para usar en server actions: devuelve null si no es admin.
export async function getAdminCtx() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return { supabase, businessId: profile.business_id }
}

// Para usar en server components del admin (page.js / layout.js).
// Cacheada por request con React cache(): layout y page comparten resultado.
// Incluye el slug del tenant para construir URLs relativas al tenant.
export const getAdminPageCtx = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, business_id')
    .eq('id', user.id)
    .single()

  let slug = null
  if (profile?.business_id) {
    const { data: business } = await supabase
      .from('businesses')
      .select('slug')
      .eq('id', profile.business_id)
      .single()
    slug = business?.slug ?? null
  }

  return { supabase, user, profile, businessId: profile?.business_id, slug }
})

// RPC con todos los counts del dashboard + badges del sidebar.
// Cacheada por request. Requiere la RPC get_admin_stats en Supabase.
export const getAdminStats = cache(async (businessId) => {
  if (!businessId) return {}
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_admin_stats', { p_business_id: businessId })
  return data ?? {}
})
