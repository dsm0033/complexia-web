# 📋 PRODUCT BACKLOG — COMPLEXIA
*Última actualización: 1 Julio 2026 — documento consolidado*

> Fusiona el backlog de la web de consultoría ComplexIA (prefijo `CW-`, Parte A) con el backlog completo
> del producto SaaS heredado de La Impecable (prefijo `F1`-`F9`/`FX`, Parte B — mismos IDs que usan
> `SAAS_FASE9.md` y el resto de la documentación, para no romper referencias cruzadas).
> La copia en `la-impecable/docs/PRODUCT_BACKLOG.md` queda legacy, no se actualiza más.

## Estado del proyecto
- **Web en vivo:** complexia.es (consultoría, en `/`) y `laimpecable.es` (SaaS, primer tenant) — ambas sirviendo desde este repo, verificado en producción real el 1 Julio 2026 (ver `SPRINTS.md` Sprint 12 Bloque 1, completado)
- **Repositorio activo:** github.com/dsm0033/complexia-web
- **Repositorio legacy (no tocar):** github.com/dsm0033/la-impecable
- **Stack:** Next.js 16 + React 19 + Tailwind v4 + Supabase + Stripe + Resend + Vercel
- **Objetivo dual:** (1) generar leads para la consultoría ComplexIA, (2) plataforma SaaS multi-tenant para PYMEs de servicios

## Prioridades y estados
- 🔴 Crítica · 🟡 Alta · 🟢 Media
- ✅ Completado · 🔄 En progreso · 📋 Pendiente · ❌ Descartado

---

# PARTE A — Backlog de la web de consultoría (prefijo `CW-`)

## FASE CW-1 — Fundaciones y Presencia

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| CW1-01 | Proyecto Next.js, estructura, Navbar, Hero, design tokens | 🔴 | ✅ |
| CW1-02 | Stack actualizado (Next 16, React 19, Tailwind v4) | 🔴 | ✅ |
| CW1-03 | Accesibilidad WCAG 2.1 AA base | 🟡 | ✅ |
| CW1-04 | Repo GitHub + Vercel + dominio complexia.es con SSL | 🔴 | ✅ |
| CW1-05 | Favicon + og-image + metadataBase/openGraph | 🟡 | ✅ |
| CW1-06 | Canonical + robots | 🟡 | ✅ |

## FASE CW-2 — Landing Page Completa

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| CW2-01 | Servicios, Metodología, Casos (La Impecable), Contacto | 🔴 | ✅ |
| CW2-02 | Nosotros | 🟡 | ❌ Descartada |
| CW2-03 | Footer con navegación, contacto y legales | 🟡 | ✅ |
| CW2-04 | Animaciones de scroll (sin Framer Motion) | 🟢 | 📋 |

## FASE CW-3 — Formulario de Contacto y Email

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| CW3-01 | `lib/mail.js` (Nodemailer, no Resend) + `/api/contacto` | 🔴 | ✅ |
| CW3-02 | Buzón `contacto@complexia.es` (SERED) + forwarder a Gmail | 🔴 | ✅ |
| CW3-03 | SPF + DKIM + DMARC en Vercel DNS | 🔴 | ✅ |
| CW3-04 | Honeypot anti-spam + escape HTML | 🟡 | ✅ |
| CW3-05 | Email de confirmación al lead | 🟢 | 📋 |

## FASE CW-4 — Páginas Interiores (consultoría)

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| CW4-01 | content/servicios.json, /servicios/[slug] | 🔴 | 📋 |
| CW4-02 | content/casos.json, /casos/[slug] | 🟡 | 📋 |
| CW4-03 | /blog, /blog/[slug] | 🟢 | 📋 |

## FASE CW-5 — Legal y Confianza

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| CW5-01 | Aviso legal (LSSI art. 10), privacidad (RGPD), cookies | 🔴 | ✅ |
| CW5-02 | NIF del titular en aviso-legal y privacidad | 🔴 | 📋 — decisión consciente del usuario de no publicarlo todavía |
| CW5-03 | Banner de cookies + Google Analytics 4 con consent gate | 🟡 | ✅ |

## FASE CW-X — Calidad e Infraestructura (consultoría)

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| CWX-01 | Documento de despliegue SERED+Vercel replicable | 🔴 | ✅ (`guia-despliegue-sered-vercel.md`) |
| CWX-02 | Lighthouse score > 90 | 🟡 | 📋 |
| CWX-03 | Enlace muerto a `#nosotros` en Navbar | 🟢 | 📋 |
| CWX-04 | Decisión Satoshi vs Instrument Sans para el wordmark | 🟢 | 📋 |

---

# PARTE B — Backlog del producto SaaS (heredado de La Impecable)

## FASE 1 — Web Pública del tenant

| ID | Tarea | Estado |
|---|---|---|
| F1-01 a F1-18 | Landing, checklist interno, deploy, dominio, SEO, marca, /servicios, /contacto, /sobre-nosotros, email, favicon, og-image | ✅ todas |

## FASE 2 — Base de Datos y Autenticación

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F2-01 a F2-10 | Supabase, tablas businesses/users/services/checklists, login, proxy por rol, seed | 🔴/🟡 | ✅ todas |

## FASE 3 — Panel de Administración

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F3-01 a F3-08 | Layout, dashboard, CRUD clientes/empleados/servicios, historial, checklists | 🔴-🟢 | ✅ todas |

## FASE 4 — Portal del Empleado

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F4-01 a F4-05b | Vista del día, checklist interactivo, cronómetro, historial | 🔴/🟡 | ✅ |
| F4-06 | Fichaje entrada/salida | 🔴 | 📋 |
| F4-07 a F4-11 | Mis horas, horas extra, vacaciones, nóminas PDF | 🟡 | ✅ |
| F4-12 | Notificación al empleado al asignarle servicio | 🟡 | 📋 |

## FASE 5 — Portal del Cliente

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F5-01 a F5-04 | Registro, perfil, historial, facturas PDF | 🔴/🟡 | ✅ |
| F5-05 | Vista "Mis citas" | 🟡 | 📋 |
| F5-06 | Reservar con datos pre-rellenados | 🟡 | 🔄 |
| F5-07 | Cancelar/reprogramar cita | 🟢 | 📋 |
| F5-08 a F5-10 | Notificaciones email, magic link, Google OAuth | 🔴/🟡 | ✅ |

## FASE 6 — Sistema de Reservas

| ID | Tarea | Prioridad | Estado | Notas |
|---|---|---|---|---|
| F6-01 a F6-04 | Tabla bookings, calendario disponibilidad, formulario público, confirmación email | 🔴/🟡 | ✅ | |
| F6-05 | WhatsApp como opción manual | 🟢 | 📋 | Nunca como pieza central |
| F6-06 a F6-13 | Gestión admin, bloqueo horarios, recordatorio 24h, config horarios, Stripe Checkout, pago local, descuento, antelación mínima | 🔴/🟡 | ✅ | |

## FASE 7 — Facturación

| ID | Tarea | Prioridad | Estado | Notas |
|---|---|---|---|---|
| F7-01 a F7-03 | Tabla invoices, generación automática, plantilla PDF | 🔴 | ✅ | IVA: base = precio ÷ 1.21 |
| F7-04 | Almacenamiento Supabase Storage | 🟡 | 🔄 | Bucket nóminas y gastos OK; falta el de facturas |
| F7-05 | Numeración secuencial IMP-2026-0001 | 🟡 | ✅ | |
| F7-06 | Envío de factura por email | 🟢 | 📋 | |
| F7-07 | Resumen fiscal mensual/trimestral | 🟢 | 📋 | |
| F7-08 a F7-13 | Bizum, generar factura manual, sincronización reservas↔historial, nómina automática, PDF nómina, contratos | 🔴/🟡 | ✅ | |
| F7-14 | Exportación A3/Contaplus | 🟢 | 📋 | |
| F7-15 | ⚠️ Revisión fiscal completa (NIF, serie IMP-YYYY-NNNN) | 🔴 | 📋 | |
| F7-16 | Disclaimer legal en UI de nóminas y ToS | 🔴 | 📋 | Bloqueante antes de nóminas a clientes SaaS reales |
| F7-17 | Validación externa por asesor laboral (SS 2026, IRPF, MEI) | 🔴 | 📋 | Bloqueante antes de nóminas a clientes SaaS reales |
| F7-18 | Exportación Modelo 111 trimestral | 🟡 | 📋 | |
| F7-19 | Exportación Modelo 190 anual | 🟡 | 📋 | |
| F7-20 | Ficheros TC1/TC2 / Sistema RED | 🟢 | 📋 | Largo plazo, requiere administrativo fiscal en el equipo |

## FASE 8 — Módulos de Inteligencia Artificial

| ID | Módulo | Prioridad | Estado | Notas |
|---|---|---|---|---|
| F8-01 | Tipo de vehículo en reserva | 🔴 | 📋 | Necesario antes del motor de precios |
| F8-02 | Precios variables por tipo de vehículo (manual) | 🟡 | 📋 | |
| F8-03 | Diagnóstico visual (IA, Claude Vision) | 🟡 | 📋 | |
| F8-04 | Análisis de reseñas | 🟡 | 📋 | |
| F8-05 | Predicción de demanda | 🟢 | 📋 | |
| F8-06 | Precios dinámicos avanzados | 🟢 | 📋 | |
| F8-07/a/b | OCR facturas proveedores (Claude Vision) | 🟡 | ✅ | ~0,006€/factura, robustez añadida |

## FASE 9 — Plataforma SaaS

*Diseño detallado: `SAAS_FASE9.md`. Ver `SPRINTS.md` Parte C (Sprint 12) para el estado de ejecución real.*

### Base multi-tenant

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F9-01 a F9-04 | Columnas SaaS en businesses, rol superadmin, panel superadmin | 🔴/🟡 | ✅ |
| F9-05 | Subdominios por negocio | 🟡 | 📋 |
| F9-06 | Personalización de marca por negocio (`business_branding`) | 🟢 | 📋 |
| F9-07 | Plantillas de configuración por sector | 🟢 | 📋 |

### Onboarding automático

| ID | Tarea | Prioridad | Estado | Notas |
|---|---|---|---|---|
| F9-08 | Landing comercial de la plataforma SaaS | 🔴 | 📋 | Decidido: marca ComplexIA, registro funcional completo (no solo marketing) |
| F9-09 | Formulario de registro | 🔴 | 📋 | |
| F9-10 | Autoprovisionamiento (business+profiles+invite) | 🔴 | 📋 | |
| F9-11 | Wizard de configuración inicial | 🟡 | 📋 | |
| F9-12 | Email de bienvenida | 🟡 | 📋 | |

### Facturación SaaS

| ID | Tarea | Prioridad | Estado | Notas |
|---|---|---|---|---|
| F9-13 | Stripe Billing (mensual/anual) | 🔴 | 📋 | Básico ~15€, Pro ~35€ |
| F9-14 | Free trial 30 días | 🟡 | 📋 | |
| F9-15 | Descuento anual | 🟢 | 📋 | |
| F9-16 | Bajas y cancelaciones | 🟡 | 📋 | |

### Notificaciones WhatsApp (plan Pro)

| ID | Tarea | Prioridad | Estado | Notas |
|---|---|---|---|---|
| F9-17 a F9-20 | Meta Cloud API, confirmación, recordatorio, número propio | 🟡/🟢 | 📋 | |

## FASE X — Calidad, Rendimiento e Infraestructura (transversal)

*Lista completa de 64 ítems (FX-01 a FX-64) en el histórico. Solo se listan aquí los que siguen abiertos — el resto (mayoría) están ✅, ver `SPRINTS.md` Parte B para el detalle completo de lo ya hecho.*

| ID | Tarea | Prioridad | Estado | Notas |
|---|---|---|---|---|
| FX-09 | Fichaje entrada/salida empleados | 🔴 | 📋 | = F4-06 |
| FX-10 | Recordatorio 24h antes (cron) | 🟢 | ✅ (1 Jul 2026) | `vercel.json` creado con el cron. Falta confirmar `CRON_SECRET` en Vercel (producción) y desplegar para que se active |
| FX-18 | Tests E2E Playwright — flujo reserva completo con Stripe | 🟢 | 📋 | Los smoke tests (FX-28) sí están hechos, pero en la-impecable; **no portados a este repo** (fuera de alcance de la conexión de Vitest del 1 Jul) |
| FX-19 | Accesibilidad WCAG 2.1 AA — base | 🟡 | 📋 | |
| FX-22 | Color Contrast Checker | 🟡 | 📋 | |
| FX-23 | TAW — test de accesibilidad | 🟡 | 📋 | |
| FX-24 | ⚠️ GRANTs explícitos en todas las tablas (deadline 30/10/2026) | 🔴 | 📋 | Supabase elimina auto-grant en esquema public |
| FX-29 | RPC `get_analytics_stats` | 🟢 | 📋 | Solo si hay lag notable |
| FX-36 | Paralelizar fetch de negocios en recordatorios | 🟢 | 📋 | |
| FX-37 | Un solo cliente admin Supabase en `stripe/route.js` | 🟢 | 📋 | |
| FX-38 | `crearFacturaAutomatica` debería recibir `db` como parámetro | 🟢 | 📋 | |
| FX-41 | ⚠️ Migraciones no reproducibles | 🟡 | ✅ (1 Jul 2026) | Carpeta `supabase/migrations/` traída con 60 archivos + 2 fixes de reproducibilidad aplicados (timestamp duplicado, policy sin DROP). Pendiente validar con `supabase db reset` real (CLI no instalada). **⚠️ Al validar: usar un proyecto Supabase desechable/local, NUNCA el proyecto vinculado — es la BD de producción real de La Impecable** |
| FX-43 | Cabecera Content-Security-Policy | 🟢 | 📋 | |
| FX-45 | ⚠️ Verificar suscripción a `checkout.session.expired` en Stripe dashboard | 🟡 | 📋 | |
| FX-51 | Facturas rectificativas | 🟢 | 📋 | |
| FX-55 | Automatizar reembolso Stripe al cancelar reserva pagada | 🟡 | 📋 | |
| FX-59 | ⏸️ Decidir modelo de facturación (simplificada vs completa) | 🔴 | ⏸️ BLOQUEADA | Diego consultará con su gestoría primero |
| FX-62b | Agenda Vista B — columnas por empleado | 🟡 | 📋 | |
| FX-63 | Unificar `showPicker` con try/catch en ~10 inputs de fecha | 🟡 | 📋 | |
| FX-64b | Regla vacaciones↔trabajo también al asignar empleado en la reserva | 🔴 | 📋 | Depende de FX-62b |

### 📋 SPRINT 10.3 — "Encuesta de Satisfacción" (sin empezar)
Tabla `reviews`, email post-servicio, `/valorar/[token]`, `/admin/calidad`, satisfacción media en analytics.

### 📋 SPRINT 10.4 — "Accesibilidad WCAG 2.1 AA" (sin empezar)
FX-19, FX-22, FX-23. AAA descartado por ROI (overkill para B2C).

### 📋 SPRINT 10.5 — "Grants Supabase" ⚠️ Deadline 30/10/2026
FX-24 — Supabase elimina el auto-grant en esquema public.

### 📋 SPRINT 10.6 — "Nóminas Legal y Fiscal"
F7-16 a F7-20 — bloqueante antes de ofrecer nóminas a clientes SaaS reales.

---

## Deuda técnica honesta (heredada, sigue vigente salvo lo marcado)

| Área | Problema | Urgencia | Estado |
|---|---|---|---|
| Stripe | Modo test, no live | Media | ⏳ Pendiente (activar con clientes reales) |
| Fichaje empleados | `BotonFichaje.jsx` presente, flujo incompleto | Media | 📋 F4-06 |
| Almacenamiento facturas | PDFs en memoria, no en Storage | Baja | 📋 F7-04 |
| Tests E2E | Solo smoke tests, y **no portados a este repo** | Media | 📋 |
| NIF negocio (tenant) | Placeholder `B-XXXXXXXX` en factura | Alta | ⚠️ Revisar antes de producción real |
| Serie facturas | Confirmar cumplimiento RD 1619/2012 | Alta | ⚠️ Revisar antes de producción real |
| ~~Migraciones SQL~~ | ~~No existían en este repo~~ | — | ✅ Resuelto 1 Jul 2026 |
| ~~Cron de recordatorios~~ | ~~Sin `vercel.json`~~ | — | ✅ Resuelto 1 Jul 2026 (falta confirmar `CRON_SECRET` en Vercel prod + deploy) |
| ~~Test runner~~ | ~~Vitest sin config ni script `test`~~ | — | ✅ Resuelto 1 Jul 2026 (80/80 tests pasan) |
| `lib/supabase/admin.js` | Documentado en CLAUDE.md pero no existe | Baja | 📋 |
