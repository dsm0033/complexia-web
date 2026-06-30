@AGENTS.md

# CLAUDE.md — ComplexIA SaaS

Guía de trabajo para Claude en este proyecto.

---

## Qué es este proyecto

**ComplexIA** tiene dos líneas de negocio en el mismo repo:

1. **SaaS multi-tenant** (línea principal) — plataforma para PYMEs del sector servicios. La Impecable (estética de vehículos) es el primer tenant (`slug = 'la-impecable'`).
2. **Consultoría de IA** (apartado secundario) — servicios a medida bajo `/consultoria`. Convive con el SaaS como sección del mismo sitio.

Antes de Junio 2026 este repo era solo la web de consultoría estática — el SaaS se añadió en el Sprint 12.

El repo original de La Impecable (`la-impecable/`) queda como rollback de emergencia. No tocar.

---

## Stack y versiones

- **Next.js 16** con **App Router** (no Pages Router)
- **React 19**
- **JavaScript / JSX** — no TypeScript en este proyecto
- **Tailwind CSS v4** — configuración en `@theme` dentro de `globals.css` (sin `tailwind.config.js`)
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) — base de datos + auth multi-tenant
- **Stripe** — pagos en reservas + suscripciones SaaS
- **Resend** — todos los emails transaccionales
- **Lucide React** para iconos (`lucide-react`) — no Heroicons
- **Recharts** — gráficos en el panel de analytics
- **Zod** — validación de formularios públicos
- **Sentry** — observabilidad en producción
- **Vitest v2** + **Playwright** — tests unitarios + smoke E2E
- **Instrument Sans** como fuente (cargada con `next/font/google`, pesos 400/500/600/700)
- **ESLint 9** con flat config (`eslint.config.mjs`)

---

## Estructura de carpetas

```
complexia-web/
├── src/
│   ├── app/                        # App Router de Next.js
│   │   ├── layout.jsx              # Root layout
│   │   ├── page.jsx                # Landing SaaS ComplexIA
│   │   ├── registro/page.jsx       # Alta de nuevos negocios
│   │   ├── login/page.jsx          # Login centralizado
│   │   ├── auth/                   # Supabase auth callbacks
│   │   ├── superadmin/             # Panel superadmin (solo role = superadmin)
│   │   └── app/
│   │       └── [slug]/             # Rutas del tenant
│   │           ├── page.jsx
│   │           ├── servicios/
│   │           ├── reservar/
│   │           ├── sobre-nosotros/
│   │           ├── contacto/
│   │           ├── admin/          # Panel admin (role = admin)
│   │           ├── empleado/       # Portal empleado (role = empleado)
│   │           └── cliente/        # Portal cliente (role = cliente)
│   │
│   ├── components/
│   │   ├── ui/                     # Primitivos reutilizables en toda la app
│   │   └── sections/               # Secciones de la landing SaaS
│   │
│   ├── lib/
│   │   ├── supabase/               # client.js, server.js, admin.js
│   │   ├── admin-context.js        # getAdminCtx() + getAdminPageCtx()
│   │   ├── pricing.js
│   │   ├── customers.js
│   │   ├── booking-emails.js
│   │   ├── stripe.js
│   │   ├── schemas/                # Schemas Zod
│   │   └── ...
│   │
│   └── proxy.js                    # Proxy de rutas + hostname rewriting
│
├── public/
├── docs/
├── supabase/
│   └── migrations/
├── tests/
├── jsconfig.json
└── next.config.js
```

---

## Alias `@/`

El alias `@/` apunta a `./src/*` (configurado en `jsconfig.json`).

```js
import { createServerClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/ui/AdminLayout'
```

---

## Routing multi-tenant

| Ruta | Descripción |
|---|---|
| `complexia.es/` | Landing SaaS |
| `complexia.es/registro` | Alta de nuevos negocios |
| `complexia.es/login` | Login centralizado |
| `complexia.es/superadmin` | Panel superadmin |
| `complexia.es/app/[slug]/` | Home pública del tenant |
| `complexia.es/app/[slug]/servicios` | Servicios del tenant |
| `complexia.es/app/[slug]/reservar` | Reservas del tenant |
| `complexia.es/app/[slug]/admin` | Panel admin del tenant |
| `complexia.es/app/[slug]/empleado` | Portal empleado |
| `complexia.es/app/[slug]/cliente` | Portal cliente |

`laimpecable.es` apunta al mismo proyecto Vercel. El `proxy.js` detecta el hostname y reescribe internamente:

```
laimpecable.es/admin    →  /app/la-impecable/admin
laimpecable.es/reservar →  /app/la-impecable/reservar
```

---

## Resolución de tenant — regla crítica

**Nunca usar `LIMIT 1` para obtener el `business_id`**. Siempre resolver desde el slug en la URL:

```js
// ❌ MAL — rompe con más de un tenant
const { data } = await supabase.from('businesses').select('id').limit(1).single()

// ✅ BIEN
const { slug } = await params
const { data: business } = await supabase
  .from('businesses')
  .select('id')
  .eq('slug', slug)
  .single()
```

---

## Patrón correcto de auth (server components)

```js
import { createServerClient } from '@/lib/supabase/server'

const supabase = await createServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('role, business_id')
  .eq('id', user.id)
  .single()
```

---

## Proxy de rutas

El archivo correcto es `src/proxy.js`. **Nunca crear `middleware.js`** — es una convención de este proyecto para Next.js 16.

---

## Migraciones SQL

- Ruta: `supabase/migrations/YYYYMMDDHHMMSS_descripcion.sql`
- Toda tabla nueva lleva GRANTs en la misma migración (Supabase elimina auto-grant en oct 2026):

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON nombre_tabla TO authenticated, anon, service_role;
```

---

## Tests

- `npm test` antes de cada commit (hay pre-commit hook)
- Tests unitarios en `src/lib/` con Vitest v2
- Smoke tests E2E en `tests/` con Playwright

---

## Convenciones de código

- Un componente por archivo, nombre en PascalCase, extensión `.jsx`
- `'use client'` solo cuando el componente usa hooks o eventos del browser
- Iconos: **Lucide React** — no Heroicons
- Estilos: exclusivamente clases de Tailwind — no CSS inline, no módulos CSS
- `service_role` solo en webhooks / cron / auth-callback — nunca en rutas del tenant

---

## Lo que NO hacer

- No TypeScript
- No `middleware.js` — usar `src/proxy.js`
- No `LIMIT 1` para obtener `business_id`
- No Heroicons — usar Lucide React
- No `service_role` en server actions del tenant
- No librerías de UI externas (Radix, shadcn) sin acordarlo
- No CSS-in-JS ni módulos CSS
