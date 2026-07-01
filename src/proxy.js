import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Portales de tenant que requieren sesión autenticada
const TENANT_PROTECTED = ['/admin', '/empleado', '/cliente']

// Rutas de plataforma que NO se reescriben cuando el request llega
// desde un dominio personalizado de tenant
const PLATFORM_PATHS = ['/superadmin', '/registro', '/auth/', '/login', '/api/']

// Dominios personalizados de tenants → slug
// Añadir aquí cada nuevo tenant con dominio propio
const CUSTOM_DOMAINS = {
  'laimpecable.es':     'la-impecable',
  'www.laimpecable.es': 'la-impecable',
}

export async function proxy(request) {
  let response = NextResponse.next({ request })

  const host    = request.headers.get('host') || ''
  const path    = request.nextUrl.pathname
  const tenantSlugFromHost = CUSTOM_DOMAINS[host] ?? null

  // ── 1. Hostname rewriting ─────────────────────────────────────────────────
  // Si el request llega desde laimpecable.es (u otro dominio custom),
  // reescribir internamente /xxx → /app/[slug]/xxx.
  // El usuario sigue viendo su dominio; Next.js sirve la ruta del tenant.
  if (tenantSlugFromHost) {
    // Favicon por tenant: el <link rel="icon"> del root layout apunta a
    // /favicon.ico (el de ComplexIA). En dominios personalizados servimos
    // el del tenant desde /public/tenants/[slug]/favicon.ico.
    // Cada tenant con dominio propio debe tener su archivo ahí.
    if (path === '/favicon.ico') {
      const rewritten = request.nextUrl.clone()
      rewritten.pathname = `/tenants/${tenantSlugFromHost}/favicon.ico`
      return NextResponse.rewrite(rewritten)
    }

    const isPlatform = PLATFORM_PATHS.some(p => path.startsWith(p))
    const alreadyRewritten = path.startsWith('/app/')

    if (!isPlatform && !alreadyRewritten) {
      const rewritten = request.nextUrl.clone()
      rewritten.pathname = path === '/'
        ? `/app/${tenantSlugFromHost}`
        : `/app/${tenantSlugFromHost}${path}`
      return NextResponse.rewrite(rewritten)
    }
  }

  // ── 2. Determinar si la ruta necesita auth guard ──────────────────────────
  // Rutas protegidas:
  //   /app/[slug]/admin, /app/[slug]/empleado, /app/[slug]/cliente
  //   /superadmin
  const segments      = path.split('/') // ['', 'app', slug, portal, ...]
  const isAppRoute    = path.startsWith('/app/') && segments.length >= 4
  const tenantPortal  = isAppRoute ? `/${segments[3]}` : ''
  const isTenantProtected = isAppRoute && TENANT_PROTECTED.includes(tenantPortal)
  const isSuperadmin  = path.startsWith('/superadmin')
  const isLoginPath   = path === '/login'

  // Rutas públicas: salir sin verificar sesión
  if (!isTenantProtected && !isSuperadmin && !isLoginPath) {
    return response
  }

  // ── 3. Verificar sesión con Supabase ──────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── 4. Sin sesión → login ─────────────────────────────────────────────────
  if ((isTenantProtected || isSuperadmin) && !user) {
    const loginUrl = new URL('/login', request.nextUrl)
    // Pasar el slug para que la página de login lo guarde en cookie
    // y el auth/callback sepa a qué tenant asignar al usuario nuevo
    const slugForLogin = tenantSlugFromHost ?? (isAppRoute ? segments[2] : null)
    if (slugForLogin) loginUrl.searchParams.set('slug', slugForLogin)
    return NextResponse.redirect(loginUrl)
  }

  // ── 5. Con sesión intentando entrar al login → panel del usuario ──────────
  if (isLoginPath && user) {
    let role = request.cookies.get('user-role')?.value
    let slug = request.cookies.get('user-slug')?.value

    // Fallback a BD: la sesión de Supabase persiste entre reinicios del
    // navegador, pero user-role/user-slug son cookies de sesión (sin maxAge)
    // y pueden haber expirado. Sin esto, el usuario con sesión viva acababa
    // redirigido a '/' — el botón "Entrar" parecía no hacer nada.
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, business_id')
        .eq('id', user.id)
        .single()

      // Sin perfil resoluble: dejar ver el login para re-autenticarse
      if (!profile?.role) return response

      role = profile.role
      if (!slug && profile.business_id) {
        const { data: business } = await supabase
          .from('businesses')
          .select('slug')
          .eq('id', profile.business_id)
          .single()
        slug = business?.slug
      }
    }

    let dest
    if (role === 'superadmin') {
      dest = '/superadmin'
    } else if (slug) {
      dest = role === 'admin'    ? `/app/${slug}/admin`
           : role === 'employee' ? `/app/${slug}/empleado`
           :                       `/app/${slug}/cliente`
    } else {
      // Sesión sin tenant conocido: mejor mostrar el login que devolver
      // a la home en silencio
      return response
    }
    return NextResponse.redirect(new URL(dest, request.nextUrl))
  }

  return response
}

export const config = {
  // /favicon.ico entra explícitamente para poder servir el del tenant
  // en dominios personalizados (ver sección 1)
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)', '/favicon.ico'],
}
