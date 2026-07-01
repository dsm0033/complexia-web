# 🗺️ PLAN DE PRÓXIMAS SESIONES — Cierre del despliegue SaaS
*Creado: 1 Julio 2026 (noche), al cerrar la sesión de activación + arreglos post-deploy.*
*Contexto completo en `SPRINTS.md` (Sprint 12, Bloques 1.5 y 1.6) y `AUDITORIA_01072026_PREDESPLIEGUE.md`.*

> **Cómo usar este documento:** las fases van en orden de prioridad. Dentro de cada fase, los ítems con ☐ son accionables tal cual. Al completar algo, márcalo aquí Y en `SPRINTS.md`/`PRODUCT_BACKLOG.md` para que no se desincronicen.

---

## FASE 0 — Remates de lo desplegado hoy (5-10 min, tú solo, sin código)

- ☐ **Rellenar los campos nuevos de dirección** en `laimpecable.es/admin` → Configuración → Empresa: Código postal (`11540`), Ciudad (`Sanlúcar de Barrameda`), Provincia (`Cádiz`), y recortar Dirección para dejar solo `C. Palmilla, 28`. Hasta que lo hagas, la web muestra solo lo que haya en Dirección.
- ☐ **Verificar visualmente en el móvil/otro navegador**: favicon dorado de La Impecable en la pestaña (si sale el de ComplexIA, es caché — probar en incógnito), botón Entrar → panel admin, tema dorado en home/servicios/contacto.
- ☐ **Descargar una factura y una nómina de prueba** desde el admin y comprobar que el pie lleva la dirección completa.

## FASE 1 — Verificaciones de infraestructura (30 min, dashboards, sin código)

Pendientes desde la migración; **bloquean el flujo de dinero si están mal**:

- ☐ **I1 — Webhook de Stripe**: en el dashboard de Stripe → Developers → Webhooks, confirmar que la URL apunta a `laimpecable.es/api/webhooks/stripe` (o el dominio de Vercel de `complexia-web`), NO al proyecto legacy `la-impecable`. Si apunta al legacy: los pagos se cobran pero la reserva nunca pasa a "pagado".
- ☐ **FX-45 — Evento `checkout.session.expired`**: en la misma pantalla del webhook, confirmar que está suscrito (lo usa la cancelación automática de carritos abandonados).
- ☐ **I2 — Cron de recordatorios**: Vercel → proyecto complexia-web → Settings → Cron Jobs → debe aparecer `/api/cron/recordatorios` a las 7:00 UTC. Idealmente esperar a mañana y comprobar en los logs que se ejecutó.
- ☐ **Stripe en modo test → live**: pendiente desde siempre; decidir cuándo activarlo (ya hay clientes reales reservando).

## FASE 2 — Seguridad pre-segundo-tenant (1 sesión de código)

De `AUDITORIA_01072026_PREDESPLIEGUE.md`. **Nada de esto es explotable con un solo tenant, pero TODO debe estar cerrado antes de dar de alta el segundo** (Bloque 2 lo hace posible):

- ☐ **M3 — Atar servicio a negocio en `crearReserva`** (`src/app/actions/booking.js`): añadir `.eq('business_id', businessId)` a la validación del servicio. Es una línea; hacerlo lo primero.
- ☐ **M2 — Quitar `service_role` de las rutas públicas**: home, servicios y reservar aún usan `createAdminClient` para `business_settings`. Crear policy anon de SELECT sobre las columnas necesarias de `business_settings` (o una vista pública) y pasar todo al cliente SSR. (La lectura de `businesses`/`services` ya va con anon + RLS desde el 1 Jul.)
- ☐ **M1 — Unificar guards de portal**: `admin/layout.js` gatea bien (rol + slug); `cliente/layout.js` solo slug; `empleado/layout.js` nada. Extraer un helper `requirePortalAccess(slug, role)` y usarlo en los tres.
- ☐ **M4 — Cabeceras de seguridad**: `next.config.mjs` está vacío. Añadir `headers()` con CSP, `X-Frame-Options`, `Referrer-Policy`. (Abierto desde la auditoría del 31/05.)
- ☐ **Idempotencia de emails del webhook Stripe**: un reintento de Stripe reenvía los emails de confirmación (la factura NO se duplica, eso ya es idempotente). Añadir guard.
- ☐ **Tests de los caminos del dinero**: `invoices`, webhook de Stripe, `crearReserva`. Los 94 tests actuales cubren cálculo, no dinero. Vitest ya está conectado.

## FASE 3 — Bloque 2: Autoprovisionamiento (el corazón del SaaS, 1-2 sesiones)

Diseño en `SAAS_FASE9.md` §4.4-4.5. Es lo que permite vender a otros negocios:

- ☐ **F9-08 — Landing SaaS en `/`**: mover la consultoría actual a `/consultoria` y montar la landing comercial de la plataforma (marca ComplexIA verde). Decidido: registro funcional completo, no solo marketing.
- ☐ **F9-09 — Formulario `/registro`**: nombre del negocio, sector, email del admin, plan. El proxy ya reserva la ruta.
- ☐ **F9-10 — Server action de alta**: INSERT en `businesses` (slug generado) + `profiles` + invitación vía Supabase Auth Admin API. ⚠️ Única pieza que justifica `service_role` fuera de webhooks/cron.
- ☐ **F9-12 — Email de bienvenida** con `buildEmail()` (URL de acceso + guía de 3 pasos).
- ☐ **I3 — Validar migraciones en BD desechable ANTES de esto**: `supabase db reset` contra un proyecto shadow o local con Docker. **NUNCA contra el proyecto vinculado "SaaS ComplexIA" — es la BD de producción real de La Impecable.** El onboarding automático depende de que el esquema sea reproducible.

## FASE 4 — Bloques 3 y 4: Onboarding y cobro (1-2 sesiones)

- ☐ **F9-11 — Wizard de configuración inicial** (Zustand multi-paso): logo/colores, horario, servicios, precios.
- ☐ **F9-13 — Stripe Billing**: productos free/basic/pro (~15€/~35€), webhooks `subscription.updated/deleted` → columnas `plan`/`active`, `stripe_customer_id` en businesses.
- ☐ **F9-14 — Free trial 30 días** (la columna `trial_ends_at` ya existe).
- ☐ **F9-16 — Bajas y cancelaciones.**

## FASE 5 — Deuda de personalización por tenant (cuando haya segundo tenant cerca)

Restos de contenido de La Impecable hardcodeado (inofensivo mientras sea el único tenant — detalle en `SPRINTS.md` Bloque 1.6):

- ☐ Páginas legales del tenant (aviso-legal/privacidad/cookies): dirección, email y NIF en el texto legal → plantillas por negocio (F9-07).
- ☐ Emails de soporte en portal cliente (`cliente/`, `perfil`, `reservar/confirmado`) → `business.email`.
- ☐ Textos de `FAQSection`, wordmark "IMPECABLE" del Navbar, contenido de home/sobre-nosotros → `business_branding` (F9-06).
- ☐ Horario de la página de contacto: leer de `business_hours` en vez del texto fijo.
- ☐ `DEFAULT_FROM_EMAIL` en `lib/resend.js` → por negocio (requiere dominios verificados en Resend, pensarlo bien).
- ☐ Migrar los 6 componentes de la landing de consultoría de Heroicons a Lucide y quitar `@heroicons/react` (única razón por la que sigue instalado).

## FASE 6 — Legal y fiscal (bloqueante antes de vender nóminas/facturas a terceros)

**No codeable a ciegas — necesita decisiones tuyas/gestoría:**

- ☐ **FX-59 — Modelo de facturación** (simplificada vs completa): consultar con tu gestoría. BLOQUEADA hasta entonces.
- ☐ **F7-15 — Revisión fiscal**: NIF real del negocio en facturas (hoy placeholder `B-XXXXXXXX`), serie `IMP-YYYY-NNNN` conforme al RD 1619/2012.
- ☐ **F7-16/F7-17 — Nóminas**: disclaimer legal en la UI + validación por asesor laboral (SS 2026, IRPF, MEI) antes de ofrecerlas a clientes SaaS reales.
- ☐ **CW5-02 — NIF en aviso legal de complexia.es** (decisión tuya pendiente de cuándo publicarlo).

## ⏰ Fechas límite duras

| Fecha | Qué | Referencia |
|---|---|---|
| **30/10/2026** | GRANTs explícitos en todas las tablas — Supabase elimina el auto-grant en `public` | FX-24 / Sprint 10.5 |

## 🔧 Recordatorios operativos

- `npm test` corre solo en cada commit (pre-commit hook). `npm run build` antes de push si tocaste rutas/config.
- Tras cada deploy: **verificación visual real**, no solo HTTP 200 (la lección del tema perdido del 1 Jul).
- Al cerrar cada sprint o sesión larga: `/code-review ultra` (~5-10 min, revisa el diff en la nube).
- La file convention `icon.png`/`favicon` dentro de `[slug]` **rompe el build de Vercel** aunque compile en local — los iconos de tenant van en `public/tenants/[slug]/` + metadata.
- Vulnerabilidades npm restantes: `nodemailer` <9 (high, fix breaking — evaluar), `postcss` anidado en `next` (moderate, esperar a Next), `esbuild`/`vite` vía Vitest 2 (solo dev).
