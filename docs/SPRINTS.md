# 🏃 SPRINTS — COMPLEXIA
*Última actualización: 1 Julio 2026 — documento consolidado*

> Este documento fusiona el historial de sprints de la web de consultoría ComplexIA (Sprints 0-5, Mayo 2026)
> con el historial completo del producto SaaS heredado de La Impecable (Sprints 1-12, Abril-Julio 2026),
> que a partir del Sprint 12 se convirtió en el mismo producto. La versión que vivía en
> `la-impecable/docs/SPRINTS.md` queda como legacy — no se vuelve a tocar (ver memoria `feedback-repo-decision`).
> **Este archivo es la fuente de verdad de aquí en adelante.**

## Metodología
- Sprints de 1-2 semanas
- Equipo: Diego (Product Owner + Developer) + Claude (Tech Lead + Mentor)
- Definition of Done: funciona + probado + commit + push + Diego lo entiende
- Auditoría de código al cerrar cada sprint o tras sesiones con muchos commits: `/code-review ultra` (revisa el diff de la rama actual respecto a `main`, ~5-10 min, corre en la nube)

---

# PARTE A — Historial de la web de consultoría ComplexIA (pre-SaaS)

## ✅ SPRINT 0 — "Arranque"
**Fecha:** 15 Mayo 2026 · **Estado:** COMPLETADO

| Tarea | Estado |
|---|---|
| Proyecto Next.js creado con create-next-app | ✅ |
| Estructura de carpetas definida | ✅ |
| Navbar responsive con menú móvil | ✅ |
| Hero section con H1, subtítulo, CTAs y stats bar | ✅ |
| Design tokens — paleta verde personalizada (H=145 S=46.7%) | ✅ |
| Tailwind CSS configurado con paleta propia | ✅ |
| README.md + CLAUDE.md + docs/ | ✅ |

## ✅ SPRINT 1 — "Stack y Calidad"
**Fecha:** 15 Mayo 2026 · **Estado:** COMPLETADO

| Tarea | Estado |
|---|---|
| Next.js 14 → 16.2.3 · React 18 → 19.2.4 | ✅ |
| Tailwind v3 → v4.3.0 (`@theme` en globals.css) | ✅ |
| ESLint 8 → 9 (flat config) | ✅ |
| Accesibilidad base: skip-link, landmarks, aria-*, `:focus-visible` | ✅ |
| Stats bar y H1 pulidos | ✅ |

## ✅ SPRINT 2 — "Presencia Online"
**Fecha:** 15 Mayo 2026 · **Estado:** COMPLETADO

| Tarea | Estado |
|---|---|
| Repositorio GitHub (github.com/dsm0033/complexia-web) | ✅ |
| Deploy en Vercel | ✅ |
| Dominio complexia.es conectado (nameservers Vercel) | ✅ |
| www.complexia.es con redirección 307 | ✅ |
| SSL automático | ✅ |

## ✅ SPRINT 3 — "Landing Completa"
**Fecha:** 16 Mayo 2026 · **Estado:** COMPLETADO (email pendiente en su momento)

| Tarea | Estado |
|---|---|
| Secciones Servicios, Metodología, Casos (La Impecable), Contacto | ✅ |
| Nosotros | ❌ Descartada por el usuario |
| `lib/mail.js` + `app/api/contacto/route.js` (Resend inicialmente) | ✅ |
| Footer | ✅ (Sprint 4.1) |

## 🔄 SPRINT 4 — "Email y Despliegue"
Bloqueado por SERED al inicio; resuelto después con Nodemailer/SMTP SERED (ver `guia-correo-sered-vercel.md`). Resend fue reemplazado por Nodemailer para el formulario de contacto.

## ✅ SPRINT 4.1 — "Marca, Footer y RGPD"
**Fecha:** 17 Mayo 2026 · **Estado:** COMPLETADO

Tipografía → Instrument Sans · guía de marca · Footer · rutas legales placeholder · checkbox RGPD obligatorio · email unificado a `contacto@complexia.es`.

## ✅ SPRINT 4.2 — "Identidad gráfica y SEO base"
**Fecha:** 18-19 Mayo 2026 · **Estado:** COMPLETADO

Favicon SVG + Isotipo.jsx reutilizable (Navbar/Footer/Hero) · Open Graph image con next/og+Satori · metadata SEO · apple-icon.png (180×180, variante clara) · canonical + robots.

## ✅ SPRINT 4.3 — "Legal y Cookies"
**Fecha:** 19 Mayo 2026 · **Estado:** COMPLETADO (NIF pendiente por decisión consciente del usuario)

Aviso legal (LSSI art. 10) · privacidad (RGPD art. 13) · cookies (LSSI art. 22.2, AEPD 2022) · `CookieBanner.jsx` · Google Analytics 4 con consent gate. **NIF eliminado deliberadamente** de aviso-legal y privacidad (el usuario no quiere publicar su DNI todavía) — el aviso legal queda incompleto respecto a LSSI art. 10 hasta que decida.

## 📋 SPRINT 5 — "Páginas Interiores" (consultoría)
**Estado:** sin empezar

| Tarea | Estado |
|---|---|
| content/servicios.json, content/casos.json | 📋 |
| /servicios/[slug], /casos/[slug] | 📋 |
| /blog, /blog/[slug] | 📋 |

**Nota (1 Jul 2026):** este sprint queda en paralelo al trabajo SaaS. Cuando se mueva la consultoría a `/consultoria`, revisar si estas páginas siguen teniendo sentido o si el foco comercial pasa a ser el SaaS.

---

# PARTE B — Historial heredado del producto SaaS (La Impecable → ComplexIA)

*Sprints 1-11 ejecutados en el repo `la-impecable` entre Abril y Junio 2026, antes de la migración de código del Sprint 12. Se conservan aquí íntegros porque son la historia real de cómo se construyó el código que hoy vive en `complexia-web/src/app/app/[slug]/`.*

## ✅ SPRINT 1 — "Cimientos" (01/04 aprox.)
Node/VS Code/Git, GitHub+Vercel+SSH, proyecto Next.js, landing migrada, checklist interno, primer deploy.

## ✅ SPRINT 2 — "Identidad y Presencia" (22/04)
Dominio laimpecable.es + www 308, SEO completo, marca "IMPECABLE · Cuidado Profesional del Vehículo", /servicios con Lucide+FAQ, /contacto, /sobre-nosotros, email info@laimpecable.es, favicon, og-image.

## ✅ SPRINT 3 — "Base de Datos" (22/04)
Proyecto Supabase, tablas businesses/users/services/checklists, login unificado, proxy de protección por rol, seed inicial.

## ✅ SPRINT 4 — "Panel Admin" (23/04)
Layout sidebar+header, dashboard con tarjetas, CRUD clientes/empleados/servicios, historial + asignar empleado, checklists.

## ✅ SPRINT 5 — "Portal Empleado" (23-24/04)
Login empleado, trabajos del día, checklist interactivo, cronómetro automático, historial en portal, estado cobrado/recogido.

## ✅ SPRINT 6 — "Reservas y Pago" (24-25/04)
Tabla `bookings`, `/reservar` público, Stripe Checkout, confirmación, webhook Stripe, panel admin de reservas, emails Resend.

## ✅ SPRINT 7 — "Portal Empleado Avanzado" (25-26/04)
Historial ampliado, "Mis horas", horas extra, `business_hours`/`business_settings`/`blocked_dates`, slots dinámicos sin overbooking, nóminas PDF (subida admin), vacaciones (Art. 38 ET, blackouts, antelación mínima).

## ✅ SPRINT 8 — "Portal Cliente" (27/04)
`customers`↔`auth.users`+RLS, magic link, Google OAuth, dashboard/historial/perfil cliente, fix webhook (vincular customer_id).

## ✅ SPRINT 9 — "Facturación y Nóminas" (27/04-07/05)
`invoices` con numeración IMP-YYYY-NNNN, pdf-lib, descarga PDF, `/admin/facturas`, pago al contado/local, descuento pago adelantado, `employee_contracts`, cálculo automático SS+IRPF, PDF de nómina legal, `/empleado/nominas`, template de email unificado (`buildEmail`).

**Nota clave (Diego, 26/04):** las nóminas automáticas son diferenciador SaaS clave.

## ✅ SPRINT 9.5 — "Optimización y Calidad" (08/05)
Audit técnico 4 fases, 17 índices SQL, fix RLS bookings, `getAdminCtx()` extraído (elimina duplicado en 6 archivos), buscadores en 5 tablas admin.

## ✅ SPRINT 9.6 — "Refactoring Arquitectónico" (10/05)
`lib/pricing.js`, `lib/customers.js`, `lib/booking-emails.js` extraídos; `crearReserva` pasa a orquestador puro; `getAdminCtx()` unifica `getBusinessId()`.

## ✅ SPRINT 9.7 — "Tests y Calidad" (11/05)
Vitest v2 instalado (v4 bloqueado por Windows App Control), 53 tests unitarios (pricing/payroll/horas/availability), pre-commit hook local (no versionado por diseño de Git).

## 🔄 SPRINT 10 — "Contabilidad y Analytics" (16/05 →)
Gastos (`expenses` CRUD, OCR Claude Vision F8-07), P&L y 5 gráficas Recharts, Libro de IVA + resumen modelo 303, GA4 + Search Console. Pendiente: exportación CSV (Bloque 4).

## ✅ SPRINT 10.1 — "Revisión Pre-SaaS" (17/05)
27 commits: fix bugs, `getAdminPageCtx()` con `React.cache()` en 26 pages, `SortableMonthlyTable` reutilizable, RPC `crear_booking_atomico` (anti race condition), RPC `get_admin_stats` (11 queries → 1), 4 actions `service_role`→SSR.

## ✅ SPRINT 10.2 — "Observabilidad y limpieza Pre-SaaS" (18/05)
Sentry integrado, logs estructurados en 7 catch críticos, Playwright + 8 smoke tests, `lib/stripe.js` extraído, `lib/validation.js`, Zod en `/reservar`.

## ✅ SPRINT 10.2.1 — "Robustez del OCR de gastos" (19/05)
OCR Opus→Haiku + downscale 1500px (coste ~0,006€/factura, 5x menos), dedup por `(business_id, provider, invoice_number)`, bucket privado `expense-files` con RLS, naming descriptivo, borrado en cascada.

## ✅ SESIÓN 21 Mayo — "UX y datos de clientes"
Teléfono obligatorio, sistema de clientes recurrentes (`buscarOCrearCliente` por email+teléfono), FK `customer_id` en bookings, ficha de cliente con historial, email de recuperación de carrito Stripe, cancelación automática por `checkout.session.expired`.

## ✅ SESIÓN 31 Mayo — "Auditoría técnica completa + seguridad"
**Informe:** `docs/AUDITORIA_31052026.md`. Auditoría 4 fases, gate de auth en `analizarFactura` (A1), Next 16.2.3→16.2.6 (A2), check de propiedad en descarga de facturas (M4), varios fixes Bajo (B1-B7). **Pendientes registrados (no codeables a ciegas):** B5 (columna muerta), A3 (migraciones no reproducibles), M5 (resolución de tenant por `LIMIT 1` — diseño de Fase 9), M1+M3 (IVA/numeración, requiere asesor fiscal), M2 (CSP).

## ✅ SESIÓN 29-30 Junio — "Agenda visual, calendarios y vacaciones"
**Guías:** `docs/AGENDA.md`, `docs/CALENDARIO_EMPLEADO.md`. Libro de IVA + modelo 303, Agenda admin (Día/Semana/Mes), Calendario del empleado, menú hamburguesa portal empleado, bloqueo mutuo vacaciones↔trabajo asignado, `src/lib/agenda.js` con tests (61→80).

## ✅ SPRINT 11 — "SaaS: Fundación" (30 Junio 2026)
**Diseño completo:** `docs/SAAS_FASE9.md`. Columnas SaaS en `businesses` (plan/active/trial_ends_at/features), rol `superadmin` + `/superadmin` protegida, panel `/superadmin/tenants` (listar, cambiar plan, suspender/activar). Code review + 6 fixes el mismo día (query redundante en proxy, optional chaining, dead code, select controlado, estado optimista, sin service_role en superadmin — usa RLS nueva).

---

# PARTE C — Sprint actual

## 🔄 SPRINT 12 — "SaaS: Migración y Onboarding"
**Fechas:** 30 Junio 2026 → en curso
**Objetivo:** Migrar La Impecable a complexia-web como primer tenant + registro y onboarding de nuevos negocios + Stripe Billing
**Diseño técnico:** `docs/SAAS_FASE9.md` secciones 4.4 y 4.5

### Decisión arquitectónica (30 Junio 2026, ya cerrada — no reabrir)

**Opción A elegida — complexia-web absorbe todo el código de La Impecable:**
- La Impecable pasa a ser el primer tenant, `slug = 'la-impecable'`
- Subpaths (`/app/[slug]/`) en lugar de subdominios wildcard → evita Vercel Pro (~20€/mes)
- `laimpecable.es` se mantiene como dominio personalizado vía rewrite de hostname en `proxy.js`
- El repo de La Impecable queda como rollback de emergencia; no se borra, no se reabre para trabajar

### BLOQUE 0 — Slice vertical · ✅ COMPLETADO (go/no-go validado)

| Tarea | Estado |
|---|---|
| `src/` creado, alias `@/` → `./src/*` | ✅ |
| Deps instaladas: Supabase, Lucide, Stripe, Recharts, Zod, Sentry, Vitest, Playwright | ✅ |
| `CLAUDE.md` reescrito · `AGENTS.md` creado | ✅ |
| `.env.local` copiado de la-impecable + `SITE_URL` → complexia.es | ✅ |
| Migración BD: columna `slug` en `businesses` (aplicada directamente en Supabase — sin archivo en este repo) | ✅ |
| `src/lib/supabase/`, `admin-context.js`, `auth/callback` multi-tenant | ✅ |
| `/app/[slug]/servicios` de prueba, 3 slugs verificados | ✅ |

### BLOQUE 1 — Migración completa de rutas · ✅ COMPLETADO (1 Julio 2026)

**Estado corregido respecto a la copia anterior de este documento**, que marcaba todo el bloque como pendiente pese a estar ya commiteado. Verificado contra `git log`:

| Tarea | Estado | Commit |
|---|---|---|
| Proxy.js hostname rewriting (`laimpecable.es` → `/app/la-impecable/`) | ✅ | `abaeec4` |
| `/login` multi-tenant + server actions con slug y cookie | ✅ | `d167ca8` |
| Portal admin/empleado/cliente + componentes + lib migrados | ✅ | `b1348a4` |
| Eliminar rutas hardcodeadas (56 archivos: href, redirect, revalidatePath, Stripe URLs) | ✅ | `35cf416` |
| `/superadmin` migrado | ✅ | (dentro de b1348a4) |
| Fix build: `@anthropic-ai/sdk` y `pdf-lib` faltaban | ✅ | `d05c77e` |
| **Conectar `laimpecable.es` como dominio personalizado en Vercel de complexia-web** | **📋 PENDIENTE** | — |

**⚠️ Mientras el último punto no se haga, todo este bloque no sirve tráfico real** — La Impecable en producción sigue en su deploy legacy hasta que se conecte el dominio.

### BLOQUE 2 — Autoprovisionamiento · 📋 PENDIENTE

| Tarea | Estado |
|---|---|
| F9-09 — Formulario de registro: nombre negocio, sector, email admin, plan | 📋 |
| F9-10 — Server action: INSERT business + profiles + invite Supabase Auth | 📋 |
| F9-12 — Email de bienvenida con `buildEmail` (URL acceso + guía 3 pasos) | 📋 |

### BLOQUE 3 — Wizard onboarding · 📋 PENDIENTE

| Tarea | Estado |
|---|---|
| F9-11a — Instalar Zustand + store multi-paso | 📋 |
| F9-11b/c/d/e — Pasos: logo/colores, horario, servicios, precios | 📋 |

### BLOQUE 4 — Stripe Billing · 📋 PENDIENTE

| Tarea | Estado |
|---|---|
| F9-13a — Productos/precios en Stripe Dashboard (free/basic/pro) | 📋 |
| F9-13b/c — Webhooks subscription updated/deleted → plan/active | 📋 |
| F9-13d — `stripe_customer_id` en `businesses` | 📋 |
| F9-14 — Free trial 30 días | 📋 |

**Riesgo clave registrado (advisor 30/06/2026):** la resolución por slug (M5 de la auditoría) no era opcional desde el día 1 — ya corregida en el Bloque 0. `auth/callback` también corregido.

---

## Decisiones Técnicas Importantes (vigentes)

1. Multi-tenant desde el día 1 — todas las tablas llevan `business_id`
2. Login unificado con roles — un solo sistema, el rol determina el portal
3. Checklists como JSON — flexibles para cualquier sector
4. Sin WhatsApp API — reservas propias en Supabase + emails con Resend (WhatsApp es backlog F9-17+)
5. IVA: base = precio ÷ 1.21 — nunca precio × 0.21

---

## Infraestructura — Cambios relevantes

| Fecha | Cambio |
|---|---|
| 30/06/2026 | Proyecto Supabase renombrado de "la-impecable" a **"SaaS ComplexIA"** |
| 30/06/2026 | Repo convertido de web de consultoría a SaaS multi-tenant |
| 01/07/2026 | Documentación consolidada: `complexia-web/docs/` pasa a ser la fuente de verdad; `la-impecable/docs/` queda legacy |
| 01/07/2026 | **Cierre de deuda de infraestructura post-migración** (ver `ARQUITECTURA.md`): `supabase/migrations/` traído (60 archivos + `config.toml`) con 2 fixes de reproducibilidad (A3) aplicados sobre la copia; `vercel.json` creado con el cron de recordatorios; Vitest conectado (`vitest.config.mjs` con alias `@/`, scripts `test`/`test:watch`, 80/80 tests pasan) + pre-commit hook recreado. Pendiente: confirmar `CRON_SECRET` en Vercel (producción) + deploy para activar el cron; validar migraciones con `supabase db reset` real contra un proyecto Supabase desechable — **nunca contra el vinculado, es la BD de producción real** (CLI no instalada en esta sesión) |
| 01/07/2026 | **Verificación funcional real** (no solo tests unitarios): `npm run build` completo (63 rutas, sin errores) + `npm run dev` con comprobación HTTP real de `/`, `/login`, `/superadmin` (307 sin sesión, correcto), `/app/la-impecable` y `/app/la-impecable/servicios` (200, contenido real de Supabase renderizado). Confirmado que nada importa el inexistente `lib/supabase/admin.js` (hueco cosmético, no bloqueante). Detectado: falta `SMTP_PASS` en `.env.local` (rompe `/api/contacto`, no bloquea el build). `README.md` reescrito (estaba tan desactualizado como los demás docs pre-consolidación) |
