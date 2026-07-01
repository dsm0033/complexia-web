# 🚦 Auditoría pre-despliegue — ComplexIA SaaS

*Fecha: 1 Julio 2026 · Alcance: solo lectura · Enfoque: seguridad del despliegue inminente de la conversión a SaaS multi-tenant*
*Base: código en `complexia-web/src/`, migrado desde `la-impecable` en el Sprint 12. Complementa a `AUDITORIA_31052026.md` — aquí solo lo relevante para el deploy de hoy.*

---

## Veredicto

**El deploy de hoy es viable** — es **single-tenant** real (solo La Impecable), y la parte más delicada de un SaaS multi-tenant (aislamiento de datos entre negocios) está **bien resuelta** donde importa: RLS por `business_id` + scoping por el `business_id` del profile, no por la URL. No encontré fuga de datos cross-tenant demostrable.

Pero hay **2 bloqueantes reales de calidad/seguridad** que se ven en producción hoy, y un conjunto de deuda que **debe cerrarse antes de aceptar el segundo tenant** (Bloque 2 — onboarding). Detalle abajo.

---

## 🔴 Bloqueantes — arreglar antes del deploy

> **✅ RESUELTOS (1 Jul 2026, tarde):** B1 y B2 cerrados — ver `SPRINTS.md` Sprint 12, Bloque 1.5. El alcance real de B1 resultó mayor: faltaba toda la capa de presentación del tenant (tema CSS, fuentes, Navbar/Footer sin montar, `next-themes` sin instalar), restaurada en la misma sesión.

| # | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| **B1** | **La página pública de servicios sigue siendo la "slice de prueba" del Bloque 0.** Renderiza con estilos inline y muestra en producción `Tenant: <slug> · Business ID: <uuid>` y `✅ Slice multi-tenant OK — datos cargados para tenant …` | `src/app/app/[slug]/servicios/page.js:59-61,126-128` | **Esto es lo que sirve hoy `laimpecable.es/servicios`.** Expone el UUID interno del negocio y texto de debug a cualquier visitante. Imagen de producto rota. |
| **B2** | **Regresión de seguridad: `next@16.2.3`.** La auditoría del 31/05 (A2) subió a `next@16.2.6` por vulnerabilidades conocidas; esa corrección **no sobrevivió la migración**. | `package.json:20` (`"next": "16.2.3"`) y `eslint-config-next: 16.2.3` | Reaplica una decisión ya tomada. `npm i next@latest eslint-config-next@latest` + `npm audit`. No hay que reconstruir el CVE — ya se decidió actualizar. |

**Verificar de paso (mismo origen que B1):** `src/app/app/[slug]/reservar/page.js` y la home del tenant `src/app/app/[slug]/page.js` también arrastran `createAdminClient` + estilos inline. Confirmar que no muestran texto de slice antes de dar el deploy por bueno.

---

## 🟠 Verificación manual de infraestructura (no es código — dashboards)

Estos no se pueden confirmar desde el repo y **bloquean el flujo de negocio si están mal**:

| # | Qué verificar | Por qué | Estado en repo |
|---|---|---|---|
| **I1** | **Webhook de Stripe apunta a `complexia-web`/`laimpecable.es`, no al deploy legacy.** | Si apunta al legacy, los pagos online se cobran pero **la reserva nunca pasa a `pagado`** (no se ejecuta `checkout.session.completed`) → cliente paga y no recibe confirmación. | Código del webhook correcto (`src/app/api/webhooks/stripe/route.js`), verifica firma. Falta confirmar la URL en el dashboard de Stripe. |
| **I2** | **Cron activo en Vercel → Settings → Cron Jobs** + `CRON_SECRET` en Production. | `vercel.json` ✅ correcto (`0 7 * * *`). El endpoint valida `Bearer CRON_SECRET`. Solo falta ver una ejecución real. | `vercel.json:1-8` ✅ · endpoint `src/app/api/cron/recordatorios/route.js:9` ✅ |
| **I3** | Migraciones reproducibles con `supabase db reset` contra un proyecto **desechable** (nunca el vinculado — es la BD de producción real). | No bloquea el deploy de hoy (el esquema ya vive aplicado en prod). Bloquea el **onboarding automático** de nuevos tenants (Bloque 2). | 60 migraciones + 2 fixes A3 presentes, sin validar (CLI no instalada). |

---

## 🟡 Deuda multi-tenant — cerrar antes del segundo tenant (Bloque 2)

Con **un solo tenant real, nada de esto es explotable hoy**. Pero es exactamente lo que rompe al abrir el SaaS a otros negocios:

- **M1 — Autorización de rol inconsistente entre portales.**
  - `admin/layout.js` gatea **bien**: comprueba `role === 'admin'` y que el `slug` de la URL coincide con el tenant del usuario (`admin/layout.js:13,16`). Modelo a copiar.
  - `cliente/layout.js` gatea el **slug** pero **no el rol** (`cliente/layout.js:23`). Un no-cliente ve el shell vacío (sin datos, por scoping).
  - `empleado/layout.js` **no gatea nada** — es puramente presentacional (`empleado/layout.js:1-3`). La autorización depende de cada `page.js`. 
  - *No hay fuga de datos* (las queries filtran por `user.id`/`business_id`), pero es frágil y no es defensa en profundidad uniforme. Unificar en un guard por portal (como ya identificó `AUDITORIA_31052026.md`: "el patrón wrapper único sigue sin existir").

- **M2 — `service_role` en rutas públicas saltándose RLS.** Home del tenant, `servicios`, `reservar` y la action `crearReserva` usan `createAdminClient` (bypass total de RLS). Hoy filtran **correctamente** por `slug`→`business_id`, pero el propio código lo marca como parche temporal (`servicios/page.js:15-18`: *"TODO (migración completa): añadir policy anon en services y usar SSR client"*). Cada ruta con `service_role` es una donde el aislamiento depende del cuidado del programador, no de la BD.

- **M3 — `crearReserva` no ata el servicio al negocio.** El servicio se valida con `.eq('id', service_id).eq('active', true)` **sin** `.eq('business_id', businessId)`, y `business_id` viene de un campo oculto del formulario (`actions/booking.js:41,61-67`). Con varios tenants, permite reservar el servicio de otro negocio contra este. Inocuo con un tenant.

- **M4 — Sin CSP ni cabeceras de seguridad.** `next.config.mjs` está vacío (M2 del 31/05, sigue abierto). Añadir `headers()` con CSP, `X-Frame-Options`, etc.

---

## 🔵 Menores / confirmados sanos

- **Webhook idempotente en lo fiscal ✅** — `crearFacturaAutomatica` deduplica por `service_record_id` (`lib/invoices.js:45-48`), así que un reintento de Stripe **no** duplica factura. **Los emails de confirmación sí se reenvían** en un reintento (`webhooks/stripe/route.js:140-174`, sin guard). Molesto, no grave.
- **`@heroicons/react` sigue en `dependencies`** (`package.json:15`) pese a la regla "solo Lucide". Limpieza.
- **`lib/supabase/admin.js`** documentado en CLAUDE.md pero inexistente — confirmado cosmético, nada lo importa.
- **Sin tests en los caminos de dinero** — `invoices`, `stripe`, el webhook y las policies RLS siguen sin cobertura (los 80 tests cubren pricing/payroll/horas/availability/agenda). El runner ya está conectado.
- **`SMTP_PASS`** faltaba en `.env.local` (rompe `/api/contacto` en local; en Vercel Production está).

---

## Lo que quedó confirmado como CORRECTO (tranquilizador)

1. **Aislamiento de datos entre tenants**: todas las rutas protegidas (`admin`/`empleado`/`cliente`) usan el cliente SSR con RLS; el `business_id` sale del profile del usuario, no de la URL manipulable. Ninguna ruta protegida usa `service_role`.
2. **Resolución de tenant por `slug`** aplicada en todas las rutas públicas; el `LIMIT 1` que quedaba (`vacaciones.js:12`) es un falso positivo (filtra por empleado/estado, no resuelve negocio).
3. **Guard de tenant en admin** (`admin/layout.js`): rol + coincidencia de slug. Modelo correcto.
4. **Webhook de Stripe** verifica la firma antes de procesar; `service_records` idempotente por `onConflict: booking_id`.
5. **Cron** protegido con `Bearer CRON_SECRET`.
6. `proxy.js` reescribe `laimpecable.es` → `/app/la-impecable/` correctamente y respeta las rutas de plataforma.

---

## Orden de trabajo recomendado

1. **Hoy, antes del deploy:** B1 (quitar modo slice de `servicios` + revisar `reservar`/home) · B2 (subir `next`) · I1 (webhook Stripe) · I2 (cron).
2. **Esta semana:** M4 (CSP) · idempotencia de emails del webhook · I3 (validar migraciones en shadow DB).
3. **Antes del Bloque 2 (onboarding):** M1 (unificar guards de portal) · M2 (policies anon + SSR en rutas públicas) · M3 (atar `service_id` a `business_id`) · tests de los caminos de dinero.
