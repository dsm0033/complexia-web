# FASE 9 — Plataforma SaaS: Diseño Técnico
*Creado: 30 Junio 2026 — Deadline primera entrega: 3 Julio 2026*
*Traído a `complexia-web/docs/` el 1 Julio 2026 (consolidación de documentación). Contenido sin cambios sustanciales respecto al original de `la-impecable/docs/SAAS_FASE9.md` (legacy) — las rutas de archivo (`src/lib/...`, `src/proxy.js`, etc.) son las mismas en ambos repos porque el código se migró literalmente. Ver `SPRINTS.md` Parte C para el estado real de ejecución (Sprint 12) y `PRODUCT_BACKLOG.md` Fase 9 para el backlog vivo.*

---

## 1. Estado del código en el momento de diseñar esta fase (30/06/2026, snapshot histórico)

### 1.1 Tabla `businesses`
Columnas pre-SaaS existentes: `id`, `name`, `email`, `phone`, `address`, `created_at`.

Columnas añadidas el 30/06/2026 (migración `20260630110000_businesses_saas_columns.sql`, aplicada en Supabase — el archivo vive solo en `la-impecable/supabase/migrations/`, no en este repo):
- `plan text NOT NULL DEFAULT 'free'` — `CHECK (plan IN ('free', 'basic', 'pro'))`
- `active boolean NOT NULL DEFAULT true` — `false` = tenant suspendido
- `trial_ends_at timestamptz DEFAULT NULL` — fin del trial; NULL = sin trial activo
- `features jsonb NOT NULL DEFAULT '{}'` — feature flags por tenant, ej. `{"nominas":true,"ia_ocr":false}`

**⚠️ SECURITY TODO (registrado en la migración):** `plan`, `active`, `trial_ends_at` y `features`
deben ser de solo escritura por `service_role` antes de activar la facturación (F9-13).
Instrucción exacta cuando llegue el momento:
```sql
REVOKE UPDATE (plan, active, trial_ends_at, features) ON businesses FROM authenticated;
GRANT  UPDATE (plan, active, trial_ends_at, features) ON businesses TO service_role;
```

### 1.2 Tabla `profiles`
```sql
id          uuid PK → auth.users(id)
business_id uuid → businesses(id)
full_name   text
phone       text
role        text NOT NULL   -- CHECK (role IN ('admin','employee','customer','superadmin'))
created_at  timestamptz
```

### 1.3 Resolución de tenant — estado actual (corregido en el Sprint 12 Bloque 0)

#### Rutas autenticadas (`/app/[slug]/admin`, `/empleado`, `/cliente`)
El tenant se resuelve por sesión SSR vía `src/lib/admin-context.js`. RLS filtra automáticamente por `business_id`. **Multi-tenant correcto.**

#### Rutas públicas/anónimas (`/app/[slug]/reservar`, `/app/[slug]/`, `/app/[slug]/servicios`, `/api/slots`)
Ya resuelven el tenant por el `slug` de la URL (corregido durante la migración), no por `get_default_business_id()` (el `LIMIT 1` original de La Impecable, que era el bloqueante M5 de la auditoría del 31/05).

#### `auth/callback` (OAuth / magic link)
Corregido: lee el `business_id` a partir del slug propagado en el estado de login, no del primer negocio de la tabla.

### 1.4 Proxy de rutas (`src/proxy.js`)
Protege `/app/[slug]/{admin,empleado,cliente}` y `/superadmin` por presencia de sesión. No valida el rol específico — eso lo hace `getAdminPageCtx`/`getAdminCtx` dentro de cada página/action.

---

## 2. Arquitectura de tenant (decisiones de diseño)

### 2.1 Autenticado — resuelto
`profile.business_id` determina el tenant. RLS lo aplica automáticamente.

### 2.2 Público/anónimo — resuelto con Opción B (subpaths), no A (subdominios)

**Decisión final (Sprint 12, distinta de la propuesta original de este documento):** se implementó con **subpaths** `/app/[slug]/...`, no subdominios wildcard. Motivo: funciona en Vercel Hobby sin coste extra, y `laimpecable.es` se resuelve igualmente vía hostname-rewrite en `proxy.js` sin necesidad de wildcard DNS. Los subdominios reales (`negocio.complexia.es`) quedan en el backlog como F9-05, para cuando el volumen de tenants lo justifique.

### 2.3 Superadmin — decisión de cross-tenant reads

**Opción elegida: service_role con gate duro de rol** (implementada en Sprint 11).
- El panel `/superadmin` llama a un server action/page que usa service_role.
- **Antes de cualquier read privilegiado**, se verifica `role === 'superadmin'` en BD (no en cookie).
- Corolario: si la verificación falla → 403, sin datos expuestos.

**Alternativa descartada:** RLS superadmin-aware en cada tabla (40+ policies en 15+ tablas, inmanejable).

---

## 3. Sprint 11 — COMPLETADO (30 Junio 2026)

Ver `SPRINTS.md` Parte B, sección "Sprint 11 — SaaS: Fundación" para el detalle día a día. Resumen: migración de columnas SaaS, panel superadmin completo, code review con 6 fixes el mismo día.

---

## 4. Backlog completo F9-05 → F9-20

*Ver `PRODUCT_BACKLOG.md` Fase 9 para el backlog vivo con estado actualizado. El detalle de diseño de cada ítem se conserva aquí.*

### 4.1 Subdominios (F9-05) — prerequisito para tenants en producción real
**Cuando implementar:** al confirmar el primer cliente SaaS (distinto de La Impecable).

Pasos técnicos:
1. Columna `slug text UNIQUE NOT NULL` en `businesses` — **ya existe**, se añadió en el Sprint 12 Bloque 0 (antes de lo previsto en este documento, porque los subpaths también la necesitan).
2. Crear `src/lib/tenant.js` — `getTenantFromRequest(req)`: lee `req.nextUrl.hostname` → extrae slug → query `businesses WHERE slug = ?`.
3. En el proxy, propagar `X-Tenant-Id` como header.
4. DNS: wildcard CNAME `*.complexia.es → cname.vercel-dns.com` + Vercel wildcard domain (requiere plan Pro).

### 4.2 Personalización de marca (F9-06)
Tabla `business_branding` (no existe todavía):
```sql
business_id  uuid PK → businesses(id)
primary_color text DEFAULT '#0ea5e9'
logo_url      text
tagline       text
```

### 4.3 Plantillas por sector (F9-07)
Tabla `sector_templates`:
```sql
id     uuid PK
sector text   -- 'peluqueria' | 'detailing' | 'masajes' | ...
name   text
services_json  jsonb
checklist_json jsonb
```

### 4.4 Onboarding automático (F9-08 a F9-12)

**F9-08 — Landing comercial SaaS**
**Decisión (1 Julio 2026, sesión de consolidación):** marca **ComplexIA**, con **registro funcional completo** (no solo página de marketing) — F9-09/F9-10 forman parte del mismo esfuerzo, no se hace un marketing-only primero.

**F9-09 — Formulario de registro**
Campos: nombre negocio, sector, email del admin, plan elegido.

**F9-10 — Autoprovisionamiento**
```
1. INSERT businesses (name, email, plan, active=true, trial_ends_at=now()+30 días)
2. INSERT profiles (role='admin', business_id=nuevo_id) vinculado al email
3. Invite email via Supabase Auth Admin (magic link de primer acceso)
4. INSERT services desde plantilla del sector (F9-07) si el admin elige una
5. INSERT business_settings con defaults
```
Todo en una sola server action con try/catch atómico.

**F9-11 — Wizard de configuración inicial**
Zustand para estado multi-paso. Pasos: (1) logo y colores, (2) horario semanal, (3) servicios, (4) precios.

**F9-12 — Email de bienvenida**
Template `buildEmail` con parámetro `tipo='bienvenida'`.

### 4.5 Facturación SaaS (F9-13 a F9-16)

**Modelo de precios (borrador):**
- Free: 0€/mes — 1 admin, 2 empleados, sin nóminas, sin OCR
- Basic: ~15€/mes — hasta 5 empleados, nóminas, analytics básico
- Pro: ~35€/mes — empleados ilimitados, OCR IA, WhatsApp, analytics avanzado

**F9-13 — Stripe Billing**
- Productos y precios en Stripe Dashboard (mensual + anual con descuento 2 meses).
- Webhook `customer.subscription.updated` → actualiza `businesses.plan` y `businesses.active`.
- Webhook `customer.subscription.deleted` → `active = false` o downgrade a free.

**⚠️ Prerequisito antes de F9-13:** aplicar el REVOKE/GRANT de la sección 1.1.

**F9-14 — Free trial 30 días** · **F9-15 — Descuento anual** · **F9-16 — Bajas y cancelaciones** (retención de datos 90 días, cron mensual).

### 4.6 Feature flags (uso de `businesses.features`)

```json
{
  "nominas": true,
  "ia_ocr": false,
  "whatsapp": false,
  "analytics_avanzado": true,
  "max_empleados": 5
}
```

Helper a crear en `src/lib/features.js` (no existe todavía):
```js
export function hasFeature(business, flag) {
  return business?.features?.[flag] === true
}
```

### 4.7 WhatsApp — plan Pro (F9-17 a F9-20)

**API:** Meta Cloud API (número compartido por defecto; gratuito hasta 1.000 conv/mes).
**Prerequisito:** `whatsapp_opt_in boolean DEFAULT false` (GDPR).

---

## 5. Registro de decisiones

| Fecha | Decisión | Alternativa descartada | Motivo |
|-------|----------|----------------------|--------|
| 30/06/2026 | Superadmin usa service_role con gate duro de rol | RLS superadmin-aware en todas las tablas | ~40 policies a tocar; frágil para tablas futuras |
| 30/06/2026 | Multi-tenant público resuelto de entrada (no aplazado) | Mantener `get_default_business_id` (Opción C original) | Se resolvió ya en el Bloque 0 del Sprint 12, antes de lo planeado |
| 30/06/2026 | `role` sigue siendo `text` libre + CHECK constraint | Tabla de roles separada | Overhead innecesario con solo 4 valores |
| 30/06/2026 | Subpaths (`/app/[slug]/`), no subdominios | Subdominios wildcard desde el día 1 | Evita Vercel Pro (~20€/mes) mientras no haya clientes reales |
| 01/07/2026 | La Impecable (repo) queda legacy, todo el desarrollo SaaS se hace en complexia-web | Seguir desarrollando en la-impecable y desplegar aparte | Consolidar en un único repo activo |
| 01/07/2026 | F9-08 con registro funcional completo desde el principio | Landing solo-marketing primero, registro después | Decisión del usuario — quiere la landing funcional de una vez |

---

## 6. Archivos y funciones clave (mapa, rutas ya actualizadas a `complexia-web`)

| Archivo | Rol | Notas SaaS |
|---------|-----|-----------|
| `src/proxy.js` | Guard de rutas | `/superadmin` en `protectedPaths` ✅ hecho |
| `src/lib/admin-context.js` | Auth SSR admin | `getSuperadminCtx()` con service_role + gate — verificar si existe, no confirmado en esta consolidación |
| `src/app/superadmin/` | Panel superadmin | ✅ hecho |
| `src/lib/features.js` | Feature flags | 📋 no existe todavía |
| `src/lib/tenant.js` | Resolución tenant por subdominio | 📋 no existe todavía (solo necesario para F9-05) |
| `src/app/auth/callback/route.js` | OAuth callback | ✅ ya multi-tenant |
| `supabase/migrations/` | Schema | ⚠️ **Esta carpeta no existe en `complexia-web`** — ver `ARQUITECTURA.md` deuda de infraestructura |

---

## 7. Checklist antes de abrir el SaaS a clientes reales (nuevos, no La Impecable)

- [ ] REVOKE UPDATE en columnas de plan/billing a `authenticated` (sección 1.1)
- [ ] F7-16: Disclaimer legal en módulo nóminas ("resultado orientativo")
- [ ] F7-17: Validación con asesor laboral de tipos SS/IRPF 2026
- [ ] Datos fiscales de La Impecable completos (NIF + domicilio) — como primer tenant, referencia para el resto
- [ ] Migraciones reproducibles — hoy no hay ni carpeta en este repo, prioridad antes que "reproducibles"
- [ ] F9-05: Subdominios por tenant implementados (si el volumen lo justifica)
- [ ] F9-13: Stripe Billing activo
- [ ] F9-14: Free trial operativo
- [ ] **`laimpecable.es` conectado como dominio en Vercel de complexia-web** (nuevo ítem, 1 Jul 2026 — sin esto el propio primer tenant no sirve tráfico real desde este repo)
