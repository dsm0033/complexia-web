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
    const role = request.cookies.get('user-role')?.value
    const slug = request.cookies.get('user-slug')?.value

    let dest
    if (role === 'superadmin') {
      dest = '/superadmin'
    } else if (slug) {
      dest = role === 'admin'    ? `/app/${slug}/admin`
           : role === 'employee' ? `/app/${slug}/empleado`
           :                       `/app/${slug}/cliente`
    } else {
      dest = '/'
    }
    return NextResponse.redirect(new URL(dest, request.nextUrl))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
}
