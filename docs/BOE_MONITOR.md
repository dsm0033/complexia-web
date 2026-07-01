# Monitor BOE — Novedades Fiscales y Laborales
*Traído a `complexia-web/docs/` el 1 Julio 2026 — ⚠️ ver nota importante abajo, el sistema descrito aquí NO se portó al repo de `complexia-web`, solo la documentación.*

> **⚠️ Estado real (1 Julio 2026):** el workflow de GitHub Actions (`.github/workflows/boe-monitor.yml`)
> y su script (`.github/scripts/boe-monitor.mjs`) **solo existen en el repo legacy `la-impecable`**.
> `complexia-web` no tiene carpeta `.github/` en absoluto. Mientras el repo `la-impecable` en GitHub
> siga existiendo con sus Actions habilitadas, el monitor **sigue funcionando** (es una automatización
> independiente del código de la app, corre en GitHub, no en Vercel). Si en algún momento se archiva o
> desconecta ese repo de GitHub, este sistema deja de avisar y habría que portarlo aquí. No es urgente,
> pero queda anotado como gap de la migración.

Sistema automático que consulta el Boletín Oficial del Estado cada semana y avisa si hay cambios que afecten al módulo de nóminas.

---

## Cómo funciona

Cada **lunes a las 8:00** (hora Madrid en verano / 7:00 en invierno) se ejecuta un workflow de GitHub Actions que:

1. Consulta el sumario del BOE de los 5 días laborables anteriores
2. Filtra publicaciones de estos departamentos:
   - Ministerio de Hacienda
   - Ministerio de Inclusión, Seguridad Social y Migraciones
   - Ministerio de Trabajo y Economía Social
3. Y cualquier documento de otro departamento que mencione en el título: IRPF, retenciones, cotización, salario mínimo, SMI, convenio colectivo
4. Si hay novedades → manda email a `diegoarqueologo@gmail.com`
5. Si no hay nada → termina sin hacer nada

**Coste: 0€.** GitHub Actions y Resend (plan free) son gratuitos para este volumen.

---

## Archivos del sistema (en el repo legacy `la-impecable`)

```
.github/
  workflows/
    boe-monitor.yml       # Define cuándo y cómo corre el workflow
  scripts/
    boe-monitor.mjs       # Lógica: consulta BOE + envía email
```

---

## Cuándo hay que actuar

Recibirás el email cuando el BOE publique algo relevante. Esto ocurre normalmente:

| Evento | Frecuencia | Qué cambia |
|---|---|---|
| Ley de Presupuestos Generales del Estado | Enero (si hay) | Tramos IRPF, tipos SS, SMI |
| Real Decreto de SMI | 1-2 veces al año | SMI en `payroll_settings` |
| Real Decreto tipos cotización SS | Enero | `ss_rates`, `contribution_groups` |
| Orden de módulos IRPF | Enero | `irpf_brackets` |

La mayoría de semanas **no llegará ningún email**, que es el comportamiento correcto.

---

## Qué hacer cuando llegue una alerta

### 1. Lee el documento del BOE
El email incluye el título y el enlace directo. Ábrelo y busca las tablas o porcentajes concretos que cambian.

### 2. Identifica qué tabla de Supabase afecta

---

## Tablas de Supabase y cómo actualizarlas

Estas tablas viven en el proyecto Supabase compartido ("SaaS ComplexIA") — actualizarlas afecta a `complexia-web` igual que afectaba a `la-impecable`, no hace falta tocar código en ningún repo.

### `irpf_brackets` — Tramos del IRPF

| Columna | Descripción |
|---|---|
| `min_income` | Base imponible mínima del tramo (€/año) |
| `max_income` | Base imponible máxima del tramo (null = sin límite) |
| `rate` | Tipo de retención (ej: 0.19 = 19%) |
| `year` | Año fiscal al que aplica |

**Cuándo actualizar:** cuando el BOE publique una Orden o RDL que modifique los tramos del IRPF (normalmente enero).

**Ejemplo de actualización (SQL):**
```sql
UPDATE irpf_brackets
SET rate = 0.20
WHERE year = 2026 AND min_income = 20200 AND max_income = 35200;
```

### `ss_rates` — Tipos de cotización a la Seguridad Social

| Columna | Descripción |
|---|---|
| `concept` | Nombre del concepto (contingencias comunes, desempleo...) |
| `worker_rate` | % que paga el trabajador |
| `company_rate` | % que paga la empresa |
| `year` | Año al que aplica |

**Valores 2026 de referencia:**

| Concepto | Trabajador | Empresa |
|---|---|---|
| Contingencias comunes | 4,70% | 23,60% |
| Desempleo (indefinido) | 1,55% | 5,50% |
| Desempleo (temporal) | 1,60% | 6,70% |
| Formación profesional | 0,10% | 0,60% |
| FOGASA | 0% | 0,20% |
| Horas extras (normales) | 4,70% | 23,60% |
| Horas extras (fuerza mayor) | 2,00% | 12,00% |

### `contribution_groups` — Grupos de cotización

| Columna | Descripción |
|---|---|
| `group_number` | Número de grupo (1 al 11) |
| `description` | Categoría profesional |
| `min_base` | Base mínima mensual (€) |
| `max_base` | Base máxima mensual (€) |
| `year` | Año al que aplica |

### `payroll_settings` — Configuración general

| Columna | Descripción |
|---|---|
| `smi_monthly` | Salario Mínimo Interprofesional mensual (€) |
| `smi_daily` | SMI diario (€) |
| `smi_annual` | SMI anual (€) |
| `max_contribution_base` | Base máxima de cotización mensual (€) |
| `year` | Año al que aplica |

**SMI 2026 de referencia:** 1.184 €/mes (37 pagas) — verificar siempre con el BOE.

---

## Mantenimiento del sistema (en el repo legacy)

### Si caduca la API key de Resend
1. Ve a [resend.com](https://resend.com) → API Keys → Create API Key
2. Actualiza el valor en dos sitios:
   - `.env.local` de `la-impecable` → `RESEND_API_KEY=re_nueva_key`
   - GitHub (repo `la-impecable`) → Settings → Secrets → `RESEND_API_KEY` → Update secret

### Si quieres cambiar el horario
Edita `.github/workflows/boe-monitor.yml` en `la-impecable`, línea del `cron` (GitHub Actions usa UTC).

### Ejecutar manualmente
GitHub (repo `la-impecable`) → Actions → BOE Monitor → Run workflow.
