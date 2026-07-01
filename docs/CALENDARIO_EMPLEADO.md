# 👤 Calendario del empleado — Guía de uso
*Última actualización: 30 Junio 2026 · Traído a `complexia-web/docs/` el 1 Julio 2026 — código y rutas sin cambios respecto al original de `la-impecable/docs/CALENDARIO_EMPLEADO.md`, salvo el prefijo de ruta `/app/[slug]/` propio de la migración multi-tenant.*

Calendario mensual personal de cada trabajador: muestra sus **días de trabajo con los
servicios asignados**, sus **vacaciones**, los **festivos** y los días de **cierre**.
Comparte el componente entre el portal del empleado y la ficha de administración.

- **Portal del empleado:** enlace **"Mi calendario"** en la cabecera → `/app/[slug]/empleado/calendario`
  (cada trabajador ve solo el suyo).
- **Admin:** ficha del empleado (`/app/[slug]/admin/empleados/[id]/editar`) → tarjeta **"Calendario"** →
  `/app/[slug]/admin/empleados/[id]/calendario` (el admin ve el de cualquier empleado).

---

## Qué muestra

Cuadrícula mensual estilo iOS (lunes a domingo) con navegación de mes **‹ Hoy ›** (parámetro `?mes=YYYY-MM`):

- 🟠/🟢 **Servicios asignados** del día (pendiente / completado), con su hora.
- 🌴 **Vacaciones** aprobadas (rango completo, festivos incluidos, para leer claro el periodo).
- 🔴 **Festivos y cierres** (días de `blocked_dates` + días de cierre semanal del negocio).

### Detalle del día (modal)
Al **pulsar un día** con contenido se abre una ventana con:
- Los trabajos **ordenados por hora** (`10:00 · Tapicería · 120 min · Pendiente`).
- Si el día es festivo o de vacaciones, se indica arriba.
- Se cierra con la **X**, pulsando fuera o con **Esc**.

---

## Diseño responsive (portal)

La cabecera del portal del empleado usa un menú adaptable (`EmpleadoNav`):
- **Escritorio:** enlaces en fila.
- **Móvil:** botón **☰** que despliega el menú.

---

## Regla de negocio: vacaciones y trabajo no coexisten

El sistema impide que un empleado tenga trabajo asignado en un día de vacaciones, por **ambos lados**:

1. **Al asignar trabajo** (Historial → crear/editar registro): si el empleado tiene una vacación
   **aprobada** que cubre la fecha, **se bloquea** (aviso ámbar en el formulario + validación en
   servidor). Helper `empleadoDeVacaciones` en `src/lib/vacaciones.js`.
2. **Al aprobar (o crear) una vacación**: si el empleado **ya tiene trabajos** asignados en esas
   fechas, **se bloquea** indicando cuántos; hay que reasignarlos antes. Helper
   `trabajosAsignadosEnRango`.

> **Pendiente (FX-64b):** cuando exista la asignación de empleado *en la reserva* (Vista B de la
> Agenda, FX-62b), aplicar ahí la misma regla. Hoy el único punto de asignación es el Historial.

---

## Notas técnicas

- **Componentes:** `src/components/CalendarioEmpleado.jsx` (cuadrícula + modal, cliente),
  `MesNav.jsx` (navegación de mes, preserva la ruta con `usePathname`), `EmpleadoNav.jsx`
  (cabecera responsive del portal).
- **Carga de datos:** `src/lib/calendario-empleado.js` → `cargarCalendarioEmpleado(supabase, {employeeId, businessId, mes})`.
- **Lógica pura:** `src/lib/agenda.js` (`celdasMes`, `construirCeldasEmpleado`, `fechaEnRango`), con tests en `agenda.test.js` (⚠️ no ejecutados hoy en `complexia-web`, ver `ARQUITECTURA.md`).
- **Fuentes:** `service_records` (trabajo + hora vía `bookings.time_slot` por `booking_id`, excluye cancelados),
  `vacation_requests` aprobadas (solapamiento con el mes), `blocked_dates` (festivos), `business_hours` (cierres).
- **Migración requerida:** `20260630000000_blocked_dates_employee_read.sql` — sin ella, el empleado
  no ve los festivos en su portal (el resto funciona). El admin sí los ve. ⚠️ Este archivo de migración solo existe en `la-impecable/supabase/migrations/` (legacy); el cambio de esquema ya está aplicado en el Supabase compartido, pero no hay copia del `.sql` en `complexia-web` — ver `ARQUITECTURA.md`.
