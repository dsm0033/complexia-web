// Lógica pura de la Agenda (vistas día/semana/mes). Sin JSX para poder testearla.
// El posicionamiento vertical de los bloques sale de minutos desde medianoche.

export const timeToMin = t => {
  const [h, m] = String(t).split(':')
  return Number(h) * 60 + Number(m)
}

export const minToLabel = m =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

// Fecha local → 'YYYY-MM-DD' sin pasar por UTC (evita el desfase de un día).
export const isoLocal = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// día de semana con 0=lunes … 6=domingo (convención de business_hours).
export const espDayOf = isoDate => (new Date(isoDate + 'T12:00:00').getDay() + 6) % 7

export function inicioSemana(isoDate) {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() - espDayOf(isoDate))
  return isoLocal(d)
}

export function diasSemana(isoDate) {
  const start = new Date(inicioSemana(isoDate) + 'T12:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return isoLocal(d)
  })
}

// Celdas de un grid mensual lunes→domingo, con relleno de días del mes anterior y
// siguiente hasta completar semanas enteras. Devuelve ISO dates.
export function celdasMes(isoDate) {
  const d = new Date(isoDate + 'T12:00:00')
  const year = d.getFullYear()
  const month = d.getMonth()
  const offset = (new Date(year, month, 1).getDay() + 6) % 7 // días de relleno antes
  const diasMes = new Date(year, month + 1, 0).getDate()
  const semanas = Math.ceil((offset + diasMes) / 7)
  const inicio = new Date(year, month, 1 - offset)
  return Array.from({ length: semanas * 7 }, (_, i) => {
    const c = new Date(inicio)
    c.setDate(inicio.getDate() + i)
    return isoLocal(c)
  })
}

// Rango [primer día, último día] del mes que contiene isoDate (para la query).
export function rangoMes(isoDate) {
  const d = new Date(isoDate + 'T12:00:00')
  const year = d.getFullYear()
  const month = d.getMonth()
  return {
    desde: isoLocal(new Date(year, month, 1)),
    hasta: isoLocal(new Date(year, month + 1, 0)),
  }
}

// Da forma a una reserva como evento posicionable en el eje de horas.
export function shapeEvento(b, { slotDur = 60, empleado = null } = {}) {
  const inicio = timeToMin(b.time_slot)
  const dur = b.services?.duration_minutes || slotDur
  return {
    id: b.id,
    date: b.date,
    inicio,
    fin: inicio + dur,
    dur,
    servicio: b.services?.name ?? 'Servicio',
    cliente: b.customer_name,
    matricula: b.license_plate,
    estado: b.status,
    empleado,
  }
}

// Reparte eventos solapados en columnas (estilo Google Calendar): agrupa los que se
// solapan transitivamente y, dentro de cada grupo, asigna la primera columna libre.
// IMPORTANTE: pásale los eventos de UN SOLO día — dos días distintos a la misma hora
// no se solapan, pero comparten `inicio` y se repartirían mal si se mezclan.
export function repartirColumnas(eventos) {
  const ordenados = [...eventos].sort((a, b) => a.inicio - b.inicio || a.fin - b.fin)
  let grupo = []
  let grupoFin = -Infinity
  const grupos = []
  for (const ev of ordenados) {
    if (grupo.length && ev.inicio >= grupoFin) {
      grupos.push(grupo)
      grupo = []
      grupoFin = -Infinity
    }
    grupo.push(ev)
    grupoFin = Math.max(grupoFin, ev.fin)
  }
  if (grupo.length) grupos.push(grupo)

  for (const g of grupos) {
    const colFin = [] // fin del último evento colocado en cada columna
    for (const ev of g) {
      let col = colFin.findIndex(fin => ev.inicio >= fin)
      if (col === -1) {
        col = colFin.length
        colFin.push(ev.fin)
      } else {
        colFin[col] = ev.fin
      }
      ev.col = col
    }
    g.forEach(ev => { ev.totalCols = colFin.length })
  }
  return ordenados
}

// ¿Cae `date` ('YYYY-MM-DD') dentro de alguno de los rangos [{start, end}]? (inclusive)
export function fechaEnRango(date, rangos) {
  return (rangos ?? []).some(r => date >= r.start && date <= r.end)
}

// Construye las celdas del calendario mensual de un empleado con sus marcadores.
// - trabajosPorDia: { 'YYYY-MM-DD': [{ servicio, status }] }
// - vacaciones:     [{ start, end }] (rangos aprobados)
// - festivos:       { 'YYYY-MM-DD': motivo }
// - diasCerrados:   Set de day_of_week (0=lunes…6=domingo) en los que el negocio cierra
export function construirCeldasEmpleado({ baseDate, hoy, trabajosPorDia = {}, vacaciones = [], festivos = {}, diasCerrados = new Set() }) {
  const mesActual = new Date(baseDate + 'T12:00:00').getMonth()
  return celdasMes(baseDate).map(date => {
    const d = new Date(date + 'T12:00:00')
    return {
      date,
      numero: d.getDate(),
      enMes: d.getMonth() === mesActual,
      esHoy: date === hoy,
      trabajos: trabajosPorDia[date] ?? [],
      vacacion: fechaEnRango(date, vacaciones),
      festivo: festivos[date] ?? null,
      cerrado: diasCerrados.has((d.getDay() + 6) % 7),
    }
  })
}

// Eje de horas: rango de apertura/cierre de los días abiertos, ampliado si algún
// evento cae fuera. `horarios` es un array de filas business_hours (1 para día, 7 para semana).
export function calcularEje(eventos, horarios) {
  const abiertos = (horarios ?? []).filter(h => h?.is_open && h?.open_time && h?.close_time)
  let ejeInicio = abiertos.length ? Math.min(...abiertos.map(h => timeToMin(h.open_time))) : 9 * 60
  let ejeFin = abiertos.length ? Math.max(...abiertos.map(h => timeToMin(h.close_time))) : 18 * 60
  if (eventos.length) {
    ejeInicio = Math.min(ejeInicio, ...eventos.map(e => e.inicio))
    ejeFin = Math.max(ejeFin, ...eventos.map(e => e.fin))
  }
  return { ejeInicio: Math.floor(ejeInicio / 60) * 60, ejeFin: Math.ceil(ejeFin / 60) * 60 }
}
