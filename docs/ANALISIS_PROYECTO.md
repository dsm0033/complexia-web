# Análisis Exhaustivo — La Impecable / ComplexIA
*Última actualización original: 17 de Mayo de 2026 (v3 — refleja Sprint 10 bloques 1-2 + Sprint 10.1 Revisión Pre-SaaS)*
*Traído a `complexia-web/docs/` el 1 Julio 2026 (consolidación de documentación) — contenido histórico, sin reescribir. Para el estado de la migración SaaS posterior (Sprint 12), ver `SPRINTS.md` y `ARQUITECTURA.md` en esta misma carpeta.*

---

## 1. Resumen Ejecutivo: ¿Qué hemos construido?

Una **plataforma SaaS vertical para talleres de detailing** que combina en una sola aplicación lo que normalmente requiere 5-6 herramientas separadas: sistema de reservas, gestión de empleados, portal de clientes, pagos, facturación legal y nóminas automáticas.

---

## 2. Lo que llevamos construido — Inventario real

### Páginas y módulos: 47 páginas, 9 sprints de producto

| Área | Módulos | Estado |
|---|---|---|
| Web pública | Landing, Servicios, Contacto, Sobre nosotros, Aviso legal, Privacidad, Cookies | ✅ |
| Autenticación | Login unificado, roles (admin/empleado/cliente), magic link, Google OAuth | ✅ |
| Panel Admin | Dashboard, CRUD clientes, empleados, servicios, checklists, historial | ✅ |
| Admin → Reservas | Vista reservas + config horario, festivos, capacidad, días bloqueados | ✅ |
| Admin → RRHH | Horarios por empleado, horas trabajadas, contratos, nóminas, vacaciones | ✅ |
| Admin → Facturación | Lista facturas, generación PDF, descarga, filtros y búsqueda | ✅ |
| Admin → Nóminas | Generación nómina mensual, cálculo SS+IRPF, PDF legal, historial | ✅ |
| Admin → Config | Reservas, vacaciones, empresa (datos fiscales para PDFs) | ✅ |
| Portal Empleado | Trabajos del día, checklist interactivo, cronómetro, historial, mis horas | ✅ |
| Portal Empleado | Nóminas PDF descargables, solicitud de vacaciones, IBAN | ✅ |
| Portal Cliente | Dashboard, historial de servicios, descarga de facturas PDF, perfil | ✅ |
| Sistema Reservas | `/reservar` público + slots dinámicos + pago Stripe/local + confirmación | ✅ |
| Emails | Template unificado con branding desde BD + todos los eventos | ✅ |

### Base de datos: ~44 migraciones SQL (histórico completo solo en `la-impecable/supabase/migrations/`, legacy)

Las tablas principales (~21 tablas):

```
businesses              → multi-tenant base (+ slug, plan, active, trial_ends_at, features desde Fase 9)
profiles                → usuarios con roles (+ superadmin desde Fase 9)
customers               → clientes vinculados a auth.users (RLS cliente)
services                → catálogo de servicios + precios por tipo de vehículo
checklists              → checklists JSON por servicio
service_records         → historial de trabajos
bookings                → reservas con estado de pago + sincronización historial
invoices                → facturas emitidas (numeración IMP-YYYY-NNNN)
employee_contracts      → contrato, salario bruto, horas semanales, tipo, IBAN
contribution_groups     → grupos de cotización SS
ss_rates                → tipos SS trabajador/empresa por concepto
irpf_brackets           → tramos IRPF España 2026
payroll_settings        → configuración retención
time_entries            → fichajes de empleados
employee_schedules      → horarios por empleado
payslips                → nóminas subidas en PDF (Storage)
vacation_requests / vacation_entitlements / vacation_blackouts
business_hours / business_settings / blocked_dates
expenses                → gastos del negocio (Sprint 10)
```

### Código: estadísticas reales (Mayo 2026, post Sprint 10.1 — snapshot pre-migración)

| Métrica | Cantidad |
|---|---|
| Páginas Next.js | 50+ |
| Componentes React | 40+ |
| API Routes | 6 |
| Server Actions (archivos) | 14+ |
| Módulos `lib/` (lógica pura) | 10 |
| Migraciones SQL | 44 (60 a fecha de 30/06/2026, ver Fase 9) |
| Funciones RPC SECURITY DEFINER | 4 |
| Tablas en BD | ~21 |
| Tests automatizados | 53 (Vitest) — **no portados a `complexia-web`, ver `ARQUITECTURA.md`** |
| Integraciones externas | 5 (Supabase, Stripe, Resend, Google OAuth, Anthropic SDK) |

---

## 3. ¿Es genérico o es diferenciador?

Honestidad total: **tiene partes genéricas y partes genuinamente diferenciadas.**

### Partes genéricas (que cualquier SaaS tiene)
- CRUD de clientes, empleados, servicios — estándar
- Sistema de login con roles — estándar
- Landing page con SEO — estándar
- Panel admin con sidebar — estándar
- Integración con Stripe para pagos — muy común

### Partes diferenciadas para el sector

**1. Checklist operativo vinculado a la BD en tiempo real** — el empleado marca ítems, el cronómetro arranca automáticamente, y el historial registra hora exacta de inicio y fin.

**2. Módulo de vacaciones con legislación española real** — Art. 38 ET: antelación mínima configurable, blackouts de empresa, derechos por empleado, solicitud y aprobación con flujo completo.

**3. Configuración dinámica de disponibilidad** — horario semanal, festivos de España precargados, días bloqueados ad hoc, capacidad por slot, sin overbooking.

**4. Multi-tenant desde el día 1** — `business_id` en todas las tablas.

**5. Nóminas automáticas con legislación española 2026** *(diferenciador SaaS clave)* — cálculo automático completo: SS trabajador y empresa, IRPF por tramos reales, pagas extras, PDF legal. Ningún competidor directo lo tiene integrado.

**6. Facturación legal integrada** — numeración secuencial, IVA correcto (base = precio ÷ 1.21), datos del emisor desde BD.

### Veredicto honesto

> **Infraestructura: genérica. Combinación vertical: diferenciadora.**

---

## 4. Arquitectura (snapshot histórico — ver `ARQUITECTURA.md` para la versión actual post-migración)

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERNET / USUARIOS                          │
│   Cliente público    Empleado     Admin (Diego)   Cliente auth  │
└────────┬────────────────┬──────────────┬───────────────┬────────┘
         ▼                ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  VERCEL (Edge + Serverless)                     │
│               NEXT.JS 16 — App Router + src/proxy.js            │
│  Server Actions (≈20 archivos) → lib/ (lógica pura) → API Routes│
└───────────────────────────────┬─────────────────────────────────┘
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│    SUPABASE     │  │     STRIPE      │  │     RESEND       │
│  Postgres + Auth │  │  Checkout       │  │  buildEmail()    │
│  + Storage + RLS │  │  Webhooks       │  │  branding por BD │
└─────────────────┘  └─────────────────┘  └──────────────────┘
```

### Patrones arquitectónicos clave (vigentes)

1. Organización por feature — cada módulo tiene su carpeta con páginas y componentes propios
2. `_components/` local — específicos de cada feature, no globales
3. `lib/` — capa de lógica pura, testeable
4. Server Actions — CRUD centralizado en `actions.js` por feature
5. API Routes solo para webhooks, descargas de ficheros y cron
6. Multi-tenant desde el día 1 — `business_id` en todas las tablas
7. Auth + RLS — Supabase SSR + Row Level Security
8. `getAdminCtx()` / `getAdminPageCtx()` / `getAdminStats()` — helpers centralizados con `React.cache()`
9. RPC `SECURITY DEFINER` para perf cuando una página haría 5+ queries paralelas

### Flujo de datos clave — Reserva con pago

```
/reservar → /api/slots (disponibilidad) → Server Action booking.js
  → pricing.calcularPrecioReserva() → customers.buscarOCrearCliente()
  → crea booking (pending) → Stripe Checkout
  → webhook checkout.session.completed → booking: confirmed
  → service_record (upsert) → crearFacturaAutomatica() → emails Resend
```

---

## 5. Mapa de páginas

50+ páginas — la estructura completa y actualizada vive en `src/app/` de `complexia-web` (ya no en `la-impecable`). Ver `ARQUITECTURA.md` para el árbol de carpetas real post-migración.

---

## 6. Migraciones SQL

**⚠️ Nota de la consolidación (1 Jul 2026):** el histórico completo de 60 migraciones vive únicamente en `la-impecable/supabase/migrations/` (repo legacy, solo lectura). `complexia-web` no tiene copia de este histórico — ver `ARQUITECTURA.md`, sección "Deuda de infraestructura conocida".

**Hitos relevantes (histórico):**
- `20260422000000_initial_schema.sql` — esquema base multi-tenant
- `20260427020000_invoices.sql` — facturación IMP-YYYY-NNNN
- `20260506*` — base del módulo de nóminas (SS, IRPF, grupos cotización)
- `20260508000000_indexes_and_rls.sql` — 17 índices + fix RLS bookings
- `20260515000000_expenses.sql` — gastos (Sprint 10 Bloque 1)
- `20260517*` — Sprint 10.1: RPCs, policies Storage
- `20260630*` — Fase 9: columnas SaaS, rol superadmin, slug multi-tenant

---

## 7. Tiempo empleado (histórico, hasta Sprint 9.7)

| Sprint | Fechas | Duración real | Contenido |
|---|---|---|---|
| Sprint 1 — Cimientos | 01/04 - 22/04 | ~3 semanas | Setup, Next.js, Vercel, dominio |
| Sprint 2 — Identidad | 22/04 | ~1 día | Landing, SEO, marca, email |
| Sprint 3 — BD | 22/04 | ~1 día | Supabase, auth, roles, seed |
| Sprint 4 — Admin | 23/04 | ~1 día | Panel completo, CRUD, 8 módulos |
| Sprint 5 — Portal Empleado | 23-24/04 | ~1 día | Checklist, cronómetro, historial |
| Sprint 6 — Reservas y Pago | 24-25/04 | ~2 días | Stripe, webhook, Resend, config |
| Sprint 7 — RRHH Avanzado | 25-26/04 | ~2 días | Horas, nóminas PDF, vacaciones |
| Sprint 8 — Portal Cliente | 27/04 | ~1 día | OAuth, magic link, historial, perfil |
| Sprint 9 — Facturación y Nóminas | 27/04-07/05 | ~10 días | Facturas PDF, nóminas automáticas |
| Sprint 9.5 — Optimización | 08/05 | ~1 día | 17 índices, buscadores, fix RLS |
| Sprint 9.6 — Refactoring | 10/05 | ~1 día | lib/ extraída |
| Tests | 11/05 | ~1 día | Vitest: 53 tests |
| **TOTAL (hasta aquí)** | | **~35 días** | **9 sprints + 3 sprints técnicos** |

*Sprints 10-12 (Contabilidad, Fase 9, migración) añaden aprox. 6 semanas más — ver `SPRINTS.md` para el detalle.*

---

## 8. Estimación de tokens consumidos (histórico, hasta Sprint 9.7)

*Nota: estimación técnica razonada, sin acceso a contadores exactos de Anthropic.*

| Fase | Complejidad | Tokens estimados |
|---|---|---|
| Sprint 1-2 (setup, landing, SEO) | Baja | ~60K |
| Sprint 3 (BD, auth, migraciones) | Media | ~100K |
| Sprint 4 (panel admin, 8 módulos CRUD) | Alta | ~200K |
| Sprint 5 (portal empleado, checklist real-time) | Alta | ~150K |
| Sprint 6 (Stripe, webhook, slots dinámicos) | Muy alta | ~250K |
| Sprint 7 (RRHH, vacaciones con legislación) | Muy alta | ~280K |
| Sprint 8 (portal cliente, OAuth, magic link) | Alta | ~150K |
| Sprint 9 (facturación, nóminas automáticas, emails) | Muy alta | ~400K |
| Sprint 9.5 + 9.6 (optimización, refactoring, tests) | Alta | ~200K |
| Conversaciones, docs y correcciones | Variable | ~150K |
| **TOTAL estimado (hasta Sprint 9.7)** | | **~1.9M tokens** |

> A precios de Claude Sonnet, coste aproximado del desarrollo hasta ese punto: **$30–60 USD**. Un desarrollador júnior en España cobra ~$2.000/mes.

---

## 9. Deuda técnica honesta

*Ver `PRODUCT_BACKLOG.md`, sección "Deuda técnica honesta" para la versión viva y actualizada (incluye los gaps nuevos detectados en la migración: migraciones SQL, cron, test runner).*

---

## 10. Calidad y flujo de desarrollo

### Tests automatizados — Vitest (histórico)

53 tests unitarios sobre `lib/`: `pricing.test.js` (8), `payroll.test.js` (14), `horas.test.js` (21), `availability.test.js` (10).

**⚠️ Estado en `complexia-web` (1 Jul 2026):** los archivos `.test.js` se copiaron en la migración, pero no hay `vitest.config` ni script `test` en `package.json` — no se ejecutan en este repo. Ver `ARQUITECTURA.md`.

### Pre-commit hook

El proyecto original tenía un hook en `.git/hooks/pre-commit` que bloqueaba commits con tests en rojo. **No versionado por diseño de Git** — no se copió a `complexia-web` en la migración (no podía copiarse, nunca estuvo en el repo). Si se quiere recuperar, hay que recrearlo a mano o migrar a Husky.

---

## 11. Comparativa con competidores directos

| Feature | La Impecable / ComplexIA | GestiónCar | Tallertop | Cita previa genérica |
|---|---|---|---|---|
| Checklist operativo digital | ✅ | ❌ | Parcial | ❌ |
| Portal empleado propio | ✅ | ❌ | ❌ | ❌ |
| Vacaciones + legislación ET | ✅ | ❌ | ❌ | ❌ |
| Nóminas automáticas SS+IRPF | ✅ | ❌ | ❌ | ❌ |
| Facturación legal con PDF | ✅ | Parcial | ❌ | ❌ |
| Portal cliente con historial | ✅ | ❌ | ❌ | Parcial |
| Reservas + pago online | ✅ | Parcial | ✅ | ✅ |
| Multi-tenant | ✅ | ✅ | ✅ | Variable |
| Precio | 🆓 ahora / 💰 SaaS ~15-35€/mes | 💰 | 💰 | 💰 |
| Español + legislación ES | ✅ | ✅ | ✅ | Variable |

---

## 12. Adaptabilidad a otros sectores

Fortaleza subestimada: la arquitectura no está hardcodeada para detailing.

| Pieza | Por qué es genérica |
|---|---|
| Roles (admin / empleado / cliente) | Tres roles universales |
| Checklists como JSON | El contenido cambia, la estructura no |
| Multi-tenant (`business_id`) | Datos aislados sin tocar código |
| Módulo de RRHH | Vacaciones, horarios, nóminas iguales en cualquier empresa española |
| Sistema de reservas | Citas, entregas, turnos — mismo concepto |
| Historial de servicios | Pedidos, reparaciones, intervenciones |
| Motor de nóminas | SS e IRPF viven en BD |

### Ejemplos de adaptación sector por sector

**Supermercado** — cajeros/reponedores/seguridad; checklists de apertura/cierre, reposición, caducidades; turnos rotativos.
**Panadería/fábrica** — oficina vs. obrador; producción por lote, APPCC; pedidos B2B con fecha de entrega.
**Tienda de muebles** — ventas vs. almacén; recepción de mercancía, montaje a domicilio; seguimiento de pedido.

Lo que habría que cambiar: textos/etiquetas, checklists (nuevos JSON), catálogo de servicios, emails (ya en BD), logo/colores (Tailwind vars). **El código de auth, RRHH, reservas, historial, facturación y panel admin no se toca.**

---

## 13. Próximos pasos — Hoja de ruta (actualizada, ver `SPRINTS.md`/`PRODUCT_BACKLOG.md` para el detalle vivo)

| Sprint | Objetivo | Estado (1 Jul 2026) |
|---|---|---|
| ✅ Sprint 8-9.7 | Portal cliente, nóminas, facturación, tests | Completado |
| ✅ Sprint 10 | Contabilidad y Analytics | Bloques 1-3 hechos, Bloque 4 (export CSV) pendiente |
| ✅ Sprint 10.1-10.2.1 | Revisión Pre-SaaS, observabilidad, OCR robusto | Completado |
| 📋 Sprint 10.3-10.6 | Satisfacción, accesibilidad AA, grants Supabase, nóminas legal | Sin empezar |
| ✅ Sprint 11 | Fundación SaaS (superadmin, panel tenants) | Completado |
| 🔄 Sprint 12 | Migración a complexia-web + onboarding + Stripe Billing | Bloque 0-1 completados, Bloque 2-4 pendientes — **en curso ahora** |

---

*Generado originalmente en sesión de trabajo Diego + Claude — 11/05/2026. Traído a complexia-web/docs — 01/07/2026.*
