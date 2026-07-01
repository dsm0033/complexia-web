# 🔍 Auditoría técnica — La Impecable (ComplexIA)

*Fecha original: 31/05/2026 · Alcance: solo lectura · Commit base: `cb706bd` (rama `main`, repo `la-impecable`)*
*Traído a `complexia-web/docs/` el 1 Julio 2026 (consolidación de documentación). Los hallazgos aquí descritos aplican al código que hoy vive en `complexia-web/src/`, migrado literalmente en el Sprint 12. Los estados "CORREGIDO" ya venían corregidos antes de la migración; los "PENDIENTE" siguen abiertos salvo que `PRODUCT_BACKLOG.md` indique lo contrario.*

**Stack:** Next.js 16.2.3 (App Router) + React 19 + Supabase (Postgres + RLS) + Stripe + Resend + Anthropic SDK + Vercel

---

## Fase 1 — Reconocimiento (mapa real)

**Lenguaje:** JavaScript (JSX), sin TypeScript. ~190 archivos versionados (en el momento de la auditoría, sobre `la-impecable`).

**Capas:**

| Capa | Ubicación | Notas |
|---|---|---|
| Presentación | `src/app/**/page.js` + `_components/*.jsx` | Server Components por defecto; islas `'use client'` para formularios |
| Lógica de negocio | `src/lib/*.js` | `pricing`, `payroll`, `availability`, `customers`, `invoices`, `booking-emails`, `stripe`, `validation` — funciones puras bien extraídas |
| Server Actions | `src/app/**/actions.js` (≈20 archivos) | Mutaciones; gatean con `getAdminCtx`/`getEmpleadoCtx`/`auth.getUser` |
| Endpoints | `src/app/api/**/route.js` | Webhook Stripe, cron recordatorios, slots, descargas PDF, auth callback |
| Gating de rutas | `src/proxy.js` (Next.js 16 usa `proxy.js`, no `middleware.js`) | Solo comprueba *sesión*, no rol |
| Datos | `supabase/migrations/*.sql` (57 migraciones en el momento de la auditoría) | RLS por `business_id` + `auth.uid()`/`auth.email()` |

**Flujo de datos principal (reserva pública):**
`/reservar` (BookingForm) → `crearReserva` (Zod → `calcularPrecioReserva` → `buscarOCrearCliente` → RPC atómica `crear_booking_atomico`) → Stripe Checkout → webhook `checkout.session.completed` → `service_records` + `crearFacturaAutomatica` + emails Resend.

**Módulo de IA (único activo):** OCR de facturas de proveedor. `gastos/actions.js#analizarFactura` → Anthropic `claude-haiku-4-5` (imagen/PDF en base64) → JSON → pre-rellena el formulario de gastos. Bien aislado, prompt fuerza español, downscale en cliente. Coste real ~0,006 €/factura.

**Veredicto Fase 1:** arquitectura de capas notablemente limpia: lógica pura en `lib/`, convención de clientes Supabase documentada en `admin-context.js`, RPCs para operaciones atómicas.

---

## ⚠️ Lo que NO se pudo verificar (incertidumbres explícitas, en su momento)

1. Estado real de la BD en producción — solo los archivos de migración, no el esquema vivo.
2. No se auditó la RLS de todas las tablas. Verificadas: `profiles`, `services`, `businesses`, `checklists`, `customers`, `service_records`, `bookings`. NO revisadas: `invoices`, `expenses`, `employees`, `employee_contracts`, `payslips`, `vacation_*`, `time_entries`.
3. Variables de entorno en Vercel — fuera de alcance.
4. Idempotencia real del webhook de Stripe en reintento/duplicado — solo razonamiento sobre el código.
5. Tests E2E con Stripe completo aplazados (FX-28); el flujo de pago real no tiene cobertura automatizada.

---

## Fase 4 — Seguridad (hallazgos por severidad)

### 🔴 Crítico

**Ninguno confirmado con certeza.** No se encontró RCE, bypass total de auth ni fuga de datos demostrable. La defensa en profundidad (RLS + re-chequeo de rol en layouts) sostiene el sistema.

### 🟠 Alto

**A1 — `analizarFactura` no comprueba autorización (Broken Access Control sobre API de pago)**
`src/app/admin/contabilidad/gastos/actions.js:84-127` (ruta original en la-impecable; en complexia-web es `src/app/app/[slug]/admin/contabilidad/gastos/actions.js`)
- **Estado:** ✅ CORREGIDO 31/05/2026 (gate con `getAdminCtx` añadido).

**A2 — Next.js 16.2.3 con vulnerabilidades conocidas**
- **Estado:** ✅ CORREGIDO 31/05/2026 (`next@16.2.6` + `npm audit fix`). **Nota (1 Jul 2026):** `complexia-web/package.json` usa `next: 16.2.3` — verificar si esta corrección sobrevivió la migración o si hay que reaplicarla.

**A3 — Las migraciones no son reproducibles (bloqueante para provisión SaaS)**
- Policy duplicada `"cliente lee su historial"` + timestamp duplicado `20260506000000`.
- **Estado:** ✅ CORREGIDO 1 Jul 2026 en la copia de `complexia-web/supabase/migrations/` (60 archivos traídos desde la-impecable + timestamp renombrado + `DROP POLICY IF EXISTS` añadido). La copia legacy en `la-impecable/supabase/migrations/` sigue con el bug original, sin tocar. Pendiente validar con `supabase db reset` real — no se pudo probar en esta sesión (CLI no instalada).

### 🟡 Medio

**M1 — IVA hardcodeado al 21%** · `src/lib/invoices.js:40` · **Estado:** 📋 PENDIENTE (F7-15).

**M2 — Sin Content-Security-Policy** · `next.config.mjs` · **Estado:** 📋 PENDIENTE.

**M3 — Numeración de factura no robusta fiscalmente** · secuencia global, no por año · **Estado:** 📋 PENDIENTE (F7-15).

**M4 — Endpoints de descarga delegan la autorización 100% en RLS** · `api/facturas/download` · `api/nominas/download` · **Estado:** ✅ CORREGIDO 31/05/2026 (check de propiedad explícito añadido).

**M5 — Resolución de tenant cableada a "el primer negocio"** · `get_default_business_id()` = `LIMIT 1` · **Estado:** ✅ CORREGIDO en el Sprint 12 Bloque 0 (resolución por slug en toda ruta pública y en `auth/callback`).

### 🔵 Bajo

| ID | Qué | Estado |
|---|---|---|
| B1 | `!process.env.RESEND_API_KEY` en vez de `!resend` en cron | ✅ CORREGIDO 31/05/2026 |
| B2 | HTML sin escapar en emails (`customer_name`/`license_plate`) | ✅ CORREGIDO 31/05/2026 |
| B3 | Sin `.max()` en campos del schema de reserva | ✅ CORREGIDO 31/05/2026 |
| B4 | `vehicle_type` no validado como enum | ✅ CORREGIDO 31/05/2026 |
| B5 | Columna muerta `customers.user_id` + policies RLS muertas | 📋 PENDIENTE (requiere migración) |
| B6 | `'info@laimpecable.es'` hardcodeado como fallback | ✅ CORREGIDO 31/05/2026 |
| B7 | Envíos de email de reserva secuenciales, no paralelos | ✅ CORREGIDO 31/05/2026 |

**CORS:** sin hallazgos — same-origin, `/api/slots` GET público de baja sensibilidad.

---

## Fase 3 — Calidad de código y tests

**Lo bueno:** legibilidad alta, naming consistente en español, `lib/` con responsabilidad única real, manejo de errores homogéneo (`{ error }` + `Sentry.captureException` con tags).

**Cobertura de tests — punto más débil:**
- 53 tests unitarios solo sobre 4 módulos: `pricing`, `payroll`, `horas`, `availability`.
- Sin tests: `invoices.js`, `customers.js`, `validation.js`, `stripe.js`, `pdf-invoice.js`, `email.js`, ningún server action, ninguna policy RLS.
- **Actualización 1 Jul 2026:** en `complexia-web` ni siquiera esos 53 tests se ejecutan (falta `vitest.config` y script `test`) — ver `ARQUITECTURA.md`.

**Duplicación concreta:** lógica de creación de factura duplicada entre `lib/invoices.js` y `api/facturas/download/route.js` (FX-38, sigue pendiente).

---

## Fase 2 — Arquitectura (síntesis)

**Sólido:** separación presentación/lógica/datos real; `lib/` puro y testeable; convención `service_role` documentada y respetada; RPCs; multi-tenant por `business_id` desde el día 1.

**Dónde haría daño al crecer (en orden, estado a 1 Jul 2026):**
1. ~~Resolución de tenant por `LIMIT 1` (M5)~~ — ✅ resuelto en Sprint 12.
2. Migraciones no reproducibles (A3) — 📋 sigue abierto, agravado en `complexia-web` (ni carpeta).
3. Autorización repartida y a veces ausente (A1 resuelto, pero el patrón "wrapper único" sigue sin existir) — 📋.
4. Acoplamiento a un proveedor de email/pago vía singletons — aceptable hoy.

---

## ✅ Lista priorizada — qué arreglar primero (estado a 1 Jul 2026)

1. ~~A1 · `analizarFactura` sin auth~~ — ✅ HECHO
2. ~~B1 · FX-33~~ — ✅ HECHO
3. **A2 · verificar que `next@16.2.6` sobrevivió la migración** (complexia-web muestra 16.2.3 en package.json — sigue por revisar)
4. ~~M4 · check de propiedad en descargas~~ — ✅ HECHO
5. ~~A3 · migraciones reproducibles~~ — ✅ HECHO 1 Jul 2026
6. ~~M5 · resolución de tenant~~ — ✅ HECHO en Sprint 12
7. **M1 + M3 · IVA configurable y numeración por año** — 📋 pendiente, requiere asesor fiscal (F7-15)
8. **Tests sobre los caminos de dinero** — 📋 el test runner ya está conectado (1 Jul 2026) pero siguen sin existir tests de `invoices`, `stripe`, webhooks — cobertura real pendiente
9. **M2 (CSP) + lote Bajo (B5)** — 📋 pendiente

---

*Nota original: proyecto bien cuidado para su etapa. La mayoría de hallazgos eran de madurez hacia SaaS, no incendios. Actualización 1 Jul 2026: la migración a `complexia-web` resolvió el hallazgo más importante (M5) pero introdujo deuda nueva de infraestructura (migraciones, tests, cron) — ver `ARQUITECTURA.md`.*
