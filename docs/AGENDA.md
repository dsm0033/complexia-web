# 📅 Agenda — Guía de uso
*Última actualización: 30 Junio 2026 · Traído a `complexia-web/docs/` el 1 Julio 2026 — código y rutas sin cambios respecto al original de `la-impecable/docs/AGENDA.md`, salvo el prefijo de ruta `/app/[slug]/` propio de la migración multi-tenant.*

La **Agenda** es la vista visual de la carga de trabajo del negocio. Muestra las reservas
colocadas en su franja horaria para ver de un vistazo qué hay cada día, a qué hora y de qué tipo,
en lugar de leerlas en una tabla.

- **Dónde:** panel admin → **Agenda** (en el menú lateral, debajo de *Reservas*).
- **Ruta:** `/app/[slug]/admin/agenda`

---

## Las tres vistas

Arriba a la derecha hay un selector **Día · Semana · Mes** y la navegación **‹ Hoy ›**.
Las flechas avanzan según la vista activa: un día, una semana o un mes. El botón **Hoy** vuelve
a la fecha actual y el selector de fecha permite saltar a cualquier día.

### 🗓️ Día
Línea de tiempo vertical con el **horario del negocio** (de la apertura al cierre configurados en
*Configuración → Reservas*). La **pausa de comida** aparece sombreada. Cada reserva es un bloque
colocado en su hora, con **altura proporcional a la duración** del servicio. Muestra: hora, servicio,
cliente · matrícula y, si tiene empleado asignado, su nombre.

Si dos reservas se solapan, se reparten en **columnas lado a lado** (como en Google Calendar) para
que no se pisen.

### 📆 Semana
Siete columnas (lunes a domingo) que comparten el mismo eje de horas. El día de hoy aparece
resaltado. Útil para ver el reparto de la carga a lo largo de la semana. Cada bloque muestra la
hora y el servicio (de forma compacta).

### 🗒️ Mes
Cuadrícula tipo calendario (estilo iOS). Cada día muestra hasta **3 reservas** (hora + servicio con
un punto de color) y, si hay más, un **"+N más"**. **Al pulsar un día saltas a su vista diaria.**
Da la foto general del mes.

---

## Colores por estado

Cada reserva se colorea según su estado de pago:

| Color | Estado | Significado |
|---|---|---|
| 🟢 Verde | Pagado online | Pagada por Stripe |
| 🔵 Azul | Pago en local | Reservada para pagar en el taller |
| 🟠 Ámbar | Pendiente de pago | Reserva recién iniciada, aún sin confirmar |

---

## Qué aparece y qué no

- **Aparece:** todo el trabajo que tiene **hora**, es decir, las **reservas** (pagadas, de pago en
  local y pendientes activas).
- **No aparece:**
  - Reservas **canceladas** (no son trabajo real; además no bloquean el hueco para nuevas reservas).
  - **Carritos abandonados** — reservas que se quedaron a medias en el pago y nunca se completaron
    (mismo criterio que usa el resto del sistema para la disponibilidad).
  - Trabajos creados **directamente en el Historial sin reserva**: al no tener franja horaria, no se
    pueden colocar en el eje. En la práctica, en La Impecable casi todo entra por reserva.

---

## El empleado en cada bloque

Hoy el empleado se asigna a un trabajo desde el **Historial**, no en la propia reserva. La Agenda
muestra el empleado **dentro del bloque** cuando la reserva tiene un registro de historial vinculado
con empleado asignado.

> **Próxima mejora prevista (FX-62b):** poder **asignar empleado a la reserva** y dividir la agenda en
> **columnas por empleado** (ver cada trabajador su carril). La base de datos ya está preparada para
> ello (la columna `bookings.employee_id` existe), así que no requerirá cambios de esquema.

---

## Notas técnicas

- **Páginas y componentes:** `src/app/app/[slug]/admin/agenda/`
  - `page.js` — orquesta las tres vistas, carga datos y calcula posiciones.
  - `_components/` — `AgendaDia`, `AgendaSemana`, `AgendaMes`, `VistaNav`, `estados.js`.
- **Lógica pura:** `src/lib/agenda.js` (conversión de horas a minutos, reparto de solapes en
  columnas, cálculo del eje de horas, cuadrícula del mes). Cubierta por **12 tests** en
  `src/lib/agenda.test.js` — ⚠️ estos tests no se ejecutan hoy en `complexia-web` (falta `vitest.config`, ver `ARQUITECTURA.md`).
- **Fuentes de datos:** `bookings` (hora, servicio, cliente, matrícula, estado), `business_hours`
  (eje y pausa), `business_settings` (duración de slot por defecto) y `service_records` (empleado
  asignado, vinculado por `booking_id`).
- **Sin migraciones:** la Agenda solo lee tablas existentes.
- **Hecho a medida** con CSS grid + Tailwind, sin librerías de calendario externas.
