import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=oauth', url.origin))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/login?error=oauth', url.origin))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=oauth', url.origin))
  }

  // Service role: necesario antes de que la sesión RLS esté activa
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: profile } = await admin
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? 'customer'
  let businessId = profile?.business_id ?? null

  // Usuario nuevo (sin profile todavía): asignar al tenant correcto
  if (!profile && user.email) {
    // Leer el slug del tenant desde la cookie que dejó la página de login
    // (el flujo es: /login?slug=xxx → guarda cookie → OAuth → aquí)
    const pendingSlug = cookieStore.get('pending-tenant-slug')?.value

    if (!pendingSlug) {
      // No hay contexto de tenant: redirigir al login con error
      return NextResponse.redirect(new URL('/login?error=no-tenant', url.origin))
    }

    const { data: business } = await admin
      .from('businesses')
      .select('id')
      .eq('slug', pendingSlug)
      .eq('active', true)
      .single()

    if (!business) {
      return NextResponse.redirect(new URL('/login?error=no-tenant', url.origin))
    }

    businessId = business.id

    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email.split('@')[0]

    await admin.from('profiles').insert({
      id: user.id,
      business_id: businessId,
      full_name: fullName,
      role: 'customer',
    })

    // Vincular o crear customer
    const { data: existing } = await admin
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .eq('business_id', businessId)
      .maybeSingle()

    if (existing) {
      await admin
        .from('customers')
        .update({ auth_user_id: user.id })
        .eq('id', existing.id)
    } else {
      await admin.from('customers').insert({
        business_id: businessId,
        full_name: fullName,
        email: user.email,
        auth_user_id: user.id,
      })
    }

    // Limpiar la cookie de pending
    cookieStore.delete('pending-tenant-slug')
  } else if (role === 'customer' && profile && user.email) {
    // Cliente ya existente: asegurar que auth_user_id está vinculado
    await admin
      .from('customers')
      .update({ auth_user_id: user.id })
      .eq('email', user.email)
      .eq('business_id', businessId)
      .is('auth_user_id', null)
  }

  // Resolver el slug del tenant para construir la URL de destino
  let slug = null
  if (businessId) {
    const { data: business } = await admin
      .from('businesses')
      .select('slug')
      .eq('id', businessId)
      .single()
    slug = business?.slug ?? null
  }

  // Guardar cookies de sesión para el proxy
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  }
  cookieStore.set('user-role', role, cookieOpts)
  if (slug) cookieStore.set('user-slug', slug, cookieOpts)

  // Construir destino según rol
  let dest
  if (role === 'superadmin') {
    dest = '/superadmin'
  } else if (!slug) {
    dest = '/login?error=no-tenant'
  } else if (role === 'admin') {
    dest = `/app/${slug}/admin`
  } else if (role === 'employee') {
    dest = `/app/${slug}/empleado`
  } else {
    dest = `/app/${slug}/cliente`
  }

  return NextResponse.redirect(new URL(dest, url.origin))
}
