# 🏗️ ARQUITECTURA TÉCNICA — COMPLEXIA
*Última actualización: 1 Julio 2026 — reescrito tras consolidar la documentación dispersa entre este repo y el legacy `la-impecable`*

> Este documento sustituye a la versión anterior (19 Mayo 2026, que describía la web de consultoría pre-SaaS) y a `la-impecable/docs/ARQUITECTURA.md` (que a partir de ahora es legacy — ver [[project-saas-migracion]] en memoria). **Esta es la fuente de verdad de aquí en adelante.**

---

## Qué es ComplexIA ahora

Dos líneas de negocio en el mismo repo:

1. **SaaS multi-tenant** (línea principal) — plataforma para PYMEs del sector servicios (reservas, empleados, facturación, nóminas). La Impecable (estética de vehículos) es el primer tenant (`slug = 'la-impecable'`).
2. **Consultoría de IA** (apartado secundario) — la web original de ComplexIA. Hoy todavía vive en `/` (Hero, Servicios, Metodología, Casos, Contacto); el plan es moverla a `/consultoria` y dejar `/` para la landing comercial del SaaS — **todavía no hecho**.

Antes de Junio 2026 este repo era solo la web estática de consultoría. El SaaS se incorporó migrando **todo** el código de `la-impecable` en el Sprint 12 (ver `SPRINTS.md`).

**El repo `la-impecable` (`C:\Users\escor\Documents\la-impecable`) queda como rollback de emergencia. No se reabre para trabajar** — ver memoria `feedback-repo-decision`.

---

## Stack (verificado en `package.json`, 1 Julio 2026)

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | Next.js 16.2.3 + React 19.2.4 | App Router, Server Components, Server Actions |
| Estilos | Tailwind CSS v4 | `@theme` en `globals.css`, sin `tailwind.config.js` |
| Iconos | Lucide React | Sustituyó a Heroicons v2 (usado en la web de consultoría original) |
| Base de datos | Supabase (`@supabase/ssr` + `@supabase/supabase-js`) | Proyecto renombrado de "la-impecable" a **"SaaS ComplexIA"** el 30/06/2026. URL: `pyjtaactsyertjhphckq.supabase.co`, región West EU (Ireland) |
| Pagos | Stripe | Checkout de reservas del tenant; Stripe Billing de suscripciones SaaS aún no implementado (F9-13) |
| Email | Resend | Emails transaccionales (`buildEmail()` unificado). Nota: la web de consultoría usaba Nodemailer/SMTP SERED para `/api/contacto` — ese endpoint sigue existiendo y sigue usando ese canal, no Resend; son dos sistemas de email distintos conviviendo |
| PDF | pdf-lib | Facturas y nóminas |
| IA | `@anthropic-ai/sdk` | OCR de facturas de gastos (Claude Vision) |
| Observabilidad | Sentry (`@sentry/nextjs`) | Proyecto "complexia/la-impecable" en Sentry, activo solo en producción |
| Gráficos | Recharts | Analytics del panel admin |
| Validación | Zod | Formularios públicos |
| Tests | Vitest v2 + Playwright | **Instalados pero no conectados** — ver "Deuda de infraestructura" más abajo |
| Fuente | Instrument Sans | `next/font/google`, pesos 400/500/600/700 |
| Hosting | Vercel | CI/CD desde GitHub, rama `main` |
| Lenguaje | JavaScript / JSX | Sin TypeScript |

---

## Estructura de carpetas (real, verificada en el filesystem)

```
complexia-web/
├── src/
│   ├── app/
│   │   ├── layout.jsx              # Root layout
│   │   ├── page.jsx                # Landing — HOY sigue siendo la de consultoría (Hero/Servicios/Metodologia/Casos/Contacto)
│   │   ├── login/                  # Login centralizado multi-tenant
│   │   ├── auth/callback/          # Callback Supabase (OAuth/magic link), resuelve tenant por slug
│   │   ├── superadmin/             # Panel superadmin (role = superadmin)
│   │   │   └── tenants/            # Listado de tenants + cambiar plan + activar/suspender
│   │   ├── legal/                  # Aviso legal, privacidad, cookies (de la web de consultoría)
│   │   ├── api/
│   │   │   ├── contacto/           # Formulario de contacto de consultoría (Nodemailer/SMTP SERED)
│   │   │   ├── slots/              # Disponibilidad de reservas (público)
│   │   │   ├── facturas/download/ · nominas/download/ · nominas/[id]/download/
│   │   │   ├── webhooks/stripe/
│   │   │   └── cron/recordatorios/ # Existe el endpoint; el cron trigger de Vercel NO está configurado (falta vercel.json)
│   │   ├── actions/                # auth.js, booking.js, services.js — server actions públicas
│   │   └── app/
│   │       └── [slug]/             # Rutas del tenant
│   │           ├── page.jsx · servicios/ · reservar/ · sobre-nosotros/ · contacto/
│   │           ├── aviso-legal/ · privacidad/ · cookies/
│   │           ├── admin/          # Panel admin completo (dashboard, clientes, empleados, historial,
│   │           │                   #   reservas, facturas, nóminas, checklists, agenda, contabilidad,
│   │           │                   #   configuración empresa/reservas/vacaciones)
│   │           ├── empleado/       # Portal empleado (trabajos del día, checklist, cronómetro, horas,
│   │           │                   #   vacaciones, nóminas, calendario)
│   │           └── cliente/        # Portal cliente (dashboard, historial, perfil)
│   │
│   ├── components/
│   │   ├── ui/                     # Navbar, Footer, CookieBanner, Isotipo, GoogleAnalytics (consultoría)
│   │   ├── sections/                # Hero, Servicios, Metodologia, Casos, Contacto (landing consultoría)
│   │   └── *.jsx                   # Componentes del SaaS heredados de la-impecable, sueltos en la raíz
│   │                               #   de components/ (AdminSidebar, EmpleadoNav, CalendarioEmpleado,
│   │                               #   ChecklistSection, SortableMonthlyTable, ThemeToggle, etc.)
│   │                               #   — no están reorganizados en subcarpetas por dominio
│   │
│   ├── lib/
│   │   ├── supabase/               # client.js, server.js — falta admin.js (cliente service_role
│   │   │                           #   con nombre propio; hoy cada archivo que lo necesita crea el suyo)
│   │   ├── admin-context.js        # getAdminCtx() + getAdminPageCtx() + getAdminStats()
│   │   ├── pricing.js · customers.js · booking-emails.js · invoices.js · pdf-invoice.js
│   │   ├── payroll.js · horas.js · availability.js · bookings.js · vacaciones.js
│   │   ├── agenda.js · calendario-empleado.js · validation.js · schemas/booking.js
│   │   ├── stripe.js · resend.js · mail.js (Nodemailer, para /api/contacto) · email.js (buildEmail)
│   │   ├── tokens.js               # Design tokens de la paleta verde (consultoría)
│   │   └── *.test.js               # Tests Vitest heredados (agenda, availability, bookings, horas,
│   │                               #   payroll, pricing) — ver "Deuda de infraestructura"
│   │
│   └── proxy.js                    # Next.js 16: NUNCA crear middleware.js, el archivo es proxy.js
│
├── public/
├── docs/                           # Esta carpeta — fuente de verdad de la documentación
├── jsconfig.json                   # Alias @/ → ./src/*
├── eslint.config.mjs
├── next.config.mjs
└── package.json
```

**`supabase/migrations/` — RESUELTO (1 Julio 2026):** las 60 migraciones de `la-impecable` se copiaron a este repo, con dos fixes de reproducibilidad aplicados sobre la copia (hallazgo A3 de `AUDITORIA_31052026.md`): timestamp duplicado `20260506000000` renombrado, y `DROP POLICY IF EXISTS` añadido antes de la recreación de `"cliente lee su historial"`. También se copió `supabase/config.toml` (con `project_id` ajustado). Sigue pendiente **verificar con `supabase db reset` real** — no se pudo probar en esta sesión porque no hay Supabase CLI instalada en esta máquina.

---

## Alias `@/`

Apunta a `./src/*` (configurado en `jsconfig.json`).

```js
import { createServerClient } from '@/lib/supabase/server'
import { getAdminPageCtx } from '@/lib/admin-context'
```

---

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `complexia.es/` | Público | Landing — hoy la de consultoría; el plan es que sea la landing SaaS (pendiente) |
| `complexia.es/login` | Público | Login centralizado, redirige por rol tras autenticar |
| `complexia.es/registro` | — | **No existe todavía** (F9-09/F9-10) — el proxy ya la reserva como ruta de plataforma |
| `complexia.es/superadmin` | Superadmin | Panel de gestión de tenants |
| `complexia.es/legal/*` | Público | Aviso legal, privacidad, cookies (de la consultoría) |
| `complexia.es/app/[slug]/` | Público | Home del tenant |
| `complexia.es/app/[slug]/servicios` \| `/reservar` \| `/sobre-nosotros` \| `/contacto` | Público | Páginas públicas del tenant |
| `complexia.es/app/[slug]/admin/*` | Admin del tenant | Panel completo (ver estructura de carpetas) |
| `complexia.es/app/[slug]/empleado/*` | Empleado del tenant | Portal empleado |
| `complexia.es/app/[slug]/cliente/*` | Cliente del tenant | Portal cliente |
| `laimpecable.es/*` | Público / Admin / Empleado / Cliente | **✅ Dominio conectado (1 Jul 2026)** — movido desde el proyecto Vercel legacy `la-impecable` al proyecto `complexia-web` (junto con `www.laimpecable.es`, que redirige 308 al dominio pelado). `src/proxy.js` reescribe internamente `laimpecable.es/admin` → `/app/la-impecable/admin`. Verificado por HTTP en producción real: home, `/reservar`, login y portales devuelven 200 con datos reales de Supabase |

---

## Resolución de tenant — regla crítica

**Nunca usar `LIMIT 1` para obtener el `business_id`.** Siempre resolver desde el slug de la URL:

```js
// ❌ MAL — rompe con más de un tenant (bug que existía en la-impecable pre-SaaS)
const { data } = await supabase.from('businesses').select('id').limit(1).single()

// ✅ BIEN
const { slug } = await params
const { data: business } = await supabase
  .from('businesses')
  .select('id')
  .eq('slug', slug)
  .single()
```

Este bug ya fue corregido durante la migración (Sprint 12, Bloque 0) en las 7 rutas públicas y en `auth/callback` que lo tenían hardwired.

---

## Patrón de auth (server components)

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

En páginas dentro de `/app/[slug]/admin/**`, usar el helper cacheado:

```js
const { supabase, profile, businessId } = await getAdminPageCtx()
```

En server actions (no en server components): `getAdminCtx()` — devuelve `null` si no es admin, la action responde `{ error: 'No autorizado' }`.

**`service_role` solo en:** webhooks, cron, `/auth/callback`, endpoints públicos (`/api/slots`, formularios anónimos). En el resto, sesión SSR + RLS.

---

## Proxy de rutas

El archivo correcto es `src/proxy.js`. **Next.js 16 no usa `middleware.js`** — es una convención de este proyecto, no crearlo.

Lógica actual (verificada en el código):
1. Si el `host` de la petición es un dominio personalizado de tenant (`CUSTOM_DOMAINS`, hoy solo `laimpecable.es`), reescribe internamente a `/app/[slug]/...` salvo que sea una ruta de plataforma (`/superadmin`, `/registro`, `/auth/`, `/login`, `/api/`).
2. Protege `/app/[slug]/{admin,empleado,cliente}` y `/superadmin` exigiendo sesión Supabase.
3. Si hay sesión y se visita `/login`, redirige al panel correspondiente según la cookie `user-role`/`user-slug`.

---

## Modelo de base de datos

Mismo esquema que tenía `la-impecable` (proyecto Supabase compartido, renombrado a "SaaS ComplexIA"). ~21 tablas. Las relevantes para multi-tenant:

```
businesses    → negocio (multi-tenant). + columnas SaaS: slug, plan, active, trial_ends_at, features (jsonb)
profiles      → usuario con role (admin/employee/client/superadmin) y business_id
```

Resto de tablas (customers, services, checklists, bookings, service_records, invoices, employee_contracts,
payslips, expenses, business_settings, business_hours, blocked_dates, vacation_*, contribution_groups,
ss_rates, irpf_brackets, payroll_settings) — sin cambios respecto al esquema pre-SaaS. **RLS activado en
todas, filtrando por `business_id`.**

**⚠️ Este repo no tiene el histórico de migraciones SQL** (ver deuda de infraestructura). El esquema vive
aplicado directamente en el proyecto Supabase compartido; para consultar cómo se llegó a él hay que mirar
`la-impecable/supabase/migrations/` (60 archivos, legacy, solo lectura).

---

## Identidad de marca — dos capas distintas

1. **Marca ComplexIA (consultoría + plataforma SaaS en general)** — paleta verde personalizada (H=145 S=46.7%), Isotipo en `components/ui/Isotipo.jsx`, wordmark como texto. Ver detalle completo en la sección "Sistema de diseño" más abajo.
2. **Marca por tenant** — cada negocio (ej. La Impecable) tiene su propia identidad (dorado `#C9A84C` sobre fondo oscuro para La Impecable) aplicada dentro de `/app/[slug]/**`. Hoy esto vive hardcodeado en el CSS heredado; la tabla `business_branding` (F9-06, personalización de marca por negocio) **no existe todavía** — es backlog.

### Sistema de diseño de la marca ComplexIA (landing/consultoría)

| Clase Tailwind | HSL | Uso principal |
|---|---|---|
| `green-950` | hsl(145, 46.7%, 10%) | Títulos principales |
| `green-900` | hsl(145, 46.7%, 15%) | Fondos oscuros (stats bar) |
| `green-800` | hsl(145, 46.7%, 22%) | Texto secundario, hover |
| `green-700` | hsl(145, 46.7%, 33.1%) | Color de marca — botones, enlaces |
| `green-300` | hsl(145, 46.7%, 70%) | Texto sobre fondos oscuros |
| `green-100` | hsl(145, 46.7%, 90%) | Fondos de pills, bordes |
| `green-50` | hsl(145, 46.7%, 97%) | Fondos de secciones alternas |

Isotipo (`components/ui/Isotipo.jsx`, `fill="currentColor"`) en Navbar (`text-green-700`), Footer
(`text-green-400` sobre `bg-green-950`), y como decoración de fondo en Hero (`text-green-100`, solo `xl+`).
El wordmark "ComplexIA" es texto puro (no SVG) por SEO.

---

## Reglas inamovibles

1. **IVA:** base = precio ÷ 1.21 — nunca precio × 0.21
2. **Multi-tenant desde el día 1:** todas las tablas con `business_id`; nunca `LIMIT 1`, siempre por `slug`
3. **`service_role` solo en:** webhooks, cron, `/auth/callback`, endpoints públicos — el resto sesión SSR + RLS
4. **Next.js 16:** NO crear `middleware.js` — usar `src/proxy.js`
5. **Emails del SaaS:** usar siempre `buildEmail()` de `src/lib/email.js` — nunca HTML hardcodeado. (El formulario de contacto de consultoría usa `lib/mail.js` con Nodemailer, es un sistema aparte)
6. **Iconos:** Lucide React — no Heroicons
7. **Sin TypeScript, sin CSS-in-JS, sin librerías de UI externas** (Radix, shadcn) sin acordarlo primero
8. **Migraciones SQL:** cada cambio de esquema debe documentarse con timestamp — pero ver deuda de infraestructura, hoy no hay carpeta `supabase/migrations/` en este repo

---

## Deuda de infraestructura — estado (1 Julio 2026)

| Gap | Estado | Detalle |
|---|---|---|
| **`supabase/migrations/`** | ✅ RESUELTO (1 Jul) | 60 migraciones copiadas + 2 fixes de reproducibilidad (A3) + `supabase/config.toml`. Pendiente validar con `supabase db reset` real (CLI no instalada en esta sesión) — **⚠️ CUIDADO al validar: el proyecto Supabase vinculado ("SaaS ComplexIA") es la base de datos de PRODUCCIÓN real de La Impecable, solo renombrada — no es una copia de pruebas. `supabase db reset` / `db push` contra él borraría datos reales. Cualquier validación de migraciones debe hacerse contra un proyecto Supabase nuevo/desechable (`supabase db reset --local` con Docker, o un proyecto shadow), nunca contra el vinculado.** |
| **`vercel.json` / cron recordatorios** | ✅ RESUELTO (1 Jul) | Creado con el cron `/api/cron/recordatorios` a las 7:00 UTC, igual que en la-impecable. `CRON_SECRET` confirmado en Vercel → Environment Variables (Production) y deploy hecho con `vercel.json` presente. **Pendiente de verificación (no bloqueante):** no se ha comprobado explícitamente en Vercel → Settings → Cron Jobs que aparezca activo, ni se ha visto una ejecución real |
| **Test runner (Vitest)** | ✅ RESUELTO (1 Jul) | `vitest.config.mjs` creado (con resolución del alias `@/`), script `test`/`test:watch` en `package.json`. Los 80 tests heredados pasan (`npm test`). Pre-commit hook recreado en `.git/hooks/pre-commit` (no versionado, no venía con la migración) |
| **`lib/supabase/admin.js`** | 📋 Sin resolver, confirmado cosmético | El `CLAUDE.md` interno documenta esta ruta, pero el archivo no existe. **Verificado (1 Jul 2026, `grep -rn "lib/supabase/admin" src/`): nada lo importa** — no bloquea el build, es solo un hueco en la documentación interna |
| **`SMTP_PASS` / env vars en Vercel Production** | ✅ RESUELTO (1 Jul, sesión de activación) | Las 12 variables de Production (Supabase, Stripe, Resend, Sentry, GA, Anthropic, Cron, SMTP_PASS) confirmadas/añadidas vía `vercel env add`. Antes de esta sesión solo existía `SMTP_PASS` en Vercel (de 42 días antes); el resto faltaba y causaba 500 reales en `/login` y `/app/[slug]`. `ANTHROPIC_API_KEY` era un placeholder (`sk-ant-...`) — sustituida por una key real nueva (alimenta el OCR de facturas en `admin/contabilidad/gastos`). De paso se corrigió `src/lib/mail.js` (Nodemailer se instanciaba a nivel de módulo, mismo riesgo que ya dio problemas con Resend) |
| **Dominio `laimpecable.es` no conectado** | ✅ RESUELTO (1 Jul, sesión de activación) | Movido desde el proyecto Vercel legacy `la-impecable` al proyecto `complexia-web` (junto con `www.laimpecable.es`). Deploy a producción hecho y verificado por HTTP: home/reservar/login/portales devuelven 200 con datos reales. De paso se corrigió la home del tenant (`src/app/app/[slug]/page.js`), que no tenía metadata propia y heredaba el `<title>` de la landing de ComplexIA |
| **Webhook de Stripe apuntando al proyecto correcto** | 📋 Sin verificar | No se ha comprobado en el dashboard de Stripe si la URL del webhook apunta a `complexia-web`/`laimpecable.es` o sigue en el deploy legacy. Revisar antes de dar por cerrada la migración de pagos |
| **Tests E2E (Playwright)** | 📋 Sin resolver | `@playwright/test` está en `package.json` pero no hay `playwright.config.js` ni carpeta `e2e/` en este repo — los smoke tests de la-impecable no se portaron. No estaba en el alcance de "conectar Vitest"; queda como tarea aparte si se quiere |
| **`docs/SPRINTS.md`/`PRODUCT_BACKLOG.md` desincronizados con el código** | ✅ RESUELTO (1 Jul) | Ver los archivos actualizados en esta carpeta |

---

## CI/CD

La rama `main` se despliega automáticamente en Vercel (confirmado 1 Jul 2026: un `git push` a `main` disparó el deploy sin intervención manual). Variables de entorno de Production **confirmadas puestas** en el panel de Vercel (1 Jul 2026): Supabase, Stripe, Resend, Sentry, GA, Anthropic (key real, no el placeholder heredado), Cron y SMTP.

---

## Documentos relacionados en esta carpeta

- `SAAS_FASE9.md` — diseño técnico completo de la Fase 9 (decisiones de tenant, superadmin, backlog F9-05 a F9-20)
- `SPRINTS.md` / `PRODUCT_BACKLOG.md` — historial y backlog consolidado
- `ANALISIS_PROYECTO.md` — inventario exhaustivo de lo construido, comparativa con competidores, adaptabilidad a otros sectores
- `AUDITORIA_31052026.md` — auditoría de seguridad/calidad (varios hallazgos siguen abiertos, ver checklist al final)
- `AGENDA.md`, `CALENDARIO_EMPLEADO.md` — guías de uso de features ya construidas
- `STACK_TECNOLOGICO.md` — explicación en lenguaje llano del stack, para referencia rápida
- `BOE_MONITOR.md` — sistema de alertas fiscales (⚠️ el GitHub Action todavía vive en el repo legacy, no portado)
- `guia-correo-sered-vercel.md`, `guia-despliegue-sered-vercel.md`, `guia-formulario-contacto.md` — infraestructura de la web de consultoría (dominio, DNS, email), siguen vigentes sin cambios
