'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}

// Resuelve el slug del tenant a partir del business_id del profile
async function resolveSlug(supabase, businessId) {
  if (!businessId) return null
  const { data } = await supabase
    .from('businesses')
    .select('slug')
    .eq('id', businessId)
    .single()
  return data?.slug ?? null
}

export async function login(prevState, formData) {
  const email    = formData.get('email')
  const password = formData.get('password')
  const slug     = formData.get('slug') // slug del tenant pasado desde el formulario

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Email o contraseña incorrectos' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', data.user.id)
    .single()

  const role         = profile?.role ?? ''
  const tenantSlug   = await resolveSlug(supabase, profile?.business_id) ?? slug ?? null

  const cookieStore = await cookies()
  cookieStore.set('user-role', role, COOKIE_OPTS)
  if (tenantSlug) cookieStore.set('user-slug', tenantSlug, COOKIE_OPTS)

  if (role === 'superadmin') redirect('/superadmin')
  else if (!tenantSlug)      redirect('/')
  else if (role === 'admin') redirect(`/app/${tenantSlug}/admin`)
  else if (role === 'employee') redirect(`/app/${tenantSlug}/empleado`)
  else redirect(`/app/${tenantSlug}/cliente`)
}

export async function loginWithGoogle(prevState, formData) {
  const slug = formData.get('slug')

  // Guardar el slug antes de salir a OAuth para que auth/callback sepa
  // a qué tenant asignar al usuario si es nuevo
  if (slug) {
    const cookieStore = await cookies()
    cookieStore.set('pending-tenant-slug', slug, { ...COOKIE_OPTS, httpOnly: false })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error || !data.url) return { error: 'No se pudo conectar con Google. Inténtalo de nuevo.' }
  redirect(data.url)
}

export async function loginWithMagicLink(prevState, formData) {
  const email = formData.get('email')
  const slug  = formData.get('slug')

  if (slug) {
    const cookieStore = await cookies()
    cookieStore.set('pending-tenant-slug', slug, { ...COOKIE_OPTS, httpOnly: false })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return { error: 'No se pudo enviar el enlace. Inténtalo de nuevo.' }
  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies()
  cookieStore.delete('user-role')
  cookieStore.delete('user-slug')

  redirect('/login')
}
