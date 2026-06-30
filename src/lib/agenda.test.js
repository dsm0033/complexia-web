import { describe, it, expect } from 'vitest'
import {
  timeToMin, repartirColumnas, calcularEje, celdasMes, diasSemana, inicioSemana,
  fechaEnRango, construirCeldasEmpleado,
} from './agenda'

const ev = (inicio, fin) => ({ inicio, fin })

describe('timeToMin', () => {
  it('convierte HH:MM(:SS) a minutos desde medianoche', () => {
    expect(timeToMin('00:00')).toBe(0)
    expect(timeToMin('09:30')).toBe(570)
    expect(timeToMin('10:00:00')).toBe(600)
    expect(timeToMin('23:59')).toBe(1439)
  })
})

describe('repartirColumnas', () => {
  it('sin solape → todos en 1 columna', () => {
    const r = repartirColumnas([ev(540, 600), ev(600, 660), ev(660, 720)])
    expect(r.every(e => e.totalCols === 1 && e.col === 0)).toBe(true)
  })

  it('eventos adyacentes (fin == inicio siguiente) no se consideran solapados', () => {
    const r = repartirColumnas([ev(540, 600), ev(600, 660)])
    expect(r.map(e => e.totalCols)).toEqual([1, 1])
  })

  it('dos que solapan → 2 columnas', () => {
    const r = repartirColumnas([ev(540, 660), ev(600, 720)])
    expect(r.every(e => e.totalCols === 2)).toBe(true)
    expect(r.map(e => e.col).sort()).toEqual([0, 1])
  })

  it('cluster transitivo de tres solapados → 3 columnas', () => {
    const r = repartirColumnas([ev(540, 660), ev(600, 720), ev(630, 700)])
    expect(r.every(e => e.totalCols === 3)).toBe(true)
  })

  it('reutiliza columna cuando el hueco lo permite', () => {
    // A 9-10 y C 10-11 caben en la col 0; B 9:30-10:30 va a la col 1
    const r = repartirColumnas([ev(540, 600), ev(570, 630), ev(600, 660)])
    const total = r[0].totalCols
    expect(total).toBe(2)
  })
})

describe('calcularEje', () => {
  it('usa el horario de los días abiertos', () => {
    const horarios = [{ is_open: true, open_time: '09:00', close_time: '18:00' }]
    expect(calcularEje([], horarios)).toEqual({ ejeInicio: 540, ejeFin: 1080 })
  })

  it('amplía el eje si un evento cae fuera del horario', () => {
    const horarios = [{ is_open: true, open_time: '09:00', close_time: '18:00' }]
    const { ejeInicio, ejeFin } = calcularEje([ev(450, 510), ev(1080, 1170)], horarios)
    expect(ejeInicio).toBe(420)  // 07:00 (redondeado hacia abajo desde 07:30)
    expect(ejeFin).toBe(1200)    // 20:00 (redondeado hacia arriba desde 19:30)
  })

  it('sin horario abierto cae a 09:00–18:00 por defecto', () => {
    expect(calcularEje([], [{ is_open: false }])).toEqual({ ejeInicio: 540, ejeFin: 1080 })
  })
})

describe('inicioSemana / diasSemana', () => {
  it('la semana empieza en lunes', () => {
    // 2026-06-29 es lunes
    expect(inicioSemana('2026-06-29')).toBe('2026-06-29')
    // 2026-07-01 es miércoles → lunes de esa semana es 29 jun
    expect(inicioSemana('2026-07-01')).toBe('2026-06-29')
    // domingo 2026-07-05 → su lunes es 29 jun
    expect(inicioSemana('2026-07-05')).toBe('2026-06-29')
  })

  it('devuelve 7 días consecutivos empezando en lunes', () => {
    const dias = diasSemana('2026-07-01')
    expect(dias).toHaveLength(7)
    expect(dias[0]).toBe('2026-06-29')
    expect(dias[6]).toBe('2026-07-05')
  })
})

describe('celdasMes', () => {
  it('rellena semanas completas (múltiplo de 7) empezando en lunes', () => {
    const celdas = celdasMes('2026-07-15')
    expect(celdas.length % 7).toBe(0)
    // 1 jul 2026 es miércoles → la primera celda es el lunes anterior (29 jun)
    expect(celdas[0]).toBe('2026-06-29')
    expect(celdas).toContain('2026-07-01')
    expect(celdas).toContain('2026-07-31')
  })
})

describe('fechaEnRango', () => {
  const rangos = [{ start: '2026-06-28', end: '2026-07-04' }]
  it('detecta fechas dentro del rango (límites inclusive)', () => {
    expect(fechaEnRango('2026-06-28', rangos)).toBe(true)
    expect(fechaEnRango('2026-07-01', rangos)).toBe(true)
    expect(fechaEnRango('2026-07-04', rangos)).toBe(true)
  })
  it('descarta fechas fuera del rango', () => {
    expect(fechaEnRango('2026-06-27', rangos)).toBe(false)
    expect(fechaEnRango('2026-07-05', rangos)).toBe(false)
    expect(fechaEnRango('2026-07-01', [])).toBe(false)
  })
})

describe('construirCeldasEmpleado', () => {
  const celdas = construirCeldasEmpleado({
    baseDate: '2026-07-01',
    hoy: '2026-07-15',
    trabajosPorDia: { '2026-07-02': [{ servicio: 'Pulido', status: 'pendiente' }, { servicio: 'Lavado', status: 'completado' }] },
    vacaciones: [{ start: '2026-06-29', end: '2026-07-05' }], // cruza el borde del mes
    festivos: { '2026-07-25': 'Santiago Apóstol' },
    diasCerrados: new Set([5, 6]), // sábado y domingo
  })
  const celdaDe = d => celdas.find(c => c.date === d)

  it('marca los servicios del día', () => {
    expect(celdaDe('2026-07-02').trabajos).toHaveLength(2)
  })
  it('marca un día dentro de un rango de vacaciones aprobado, aunque venga del mes anterior', () => {
    expect(celdaDe('2026-06-29').vacacion).toBe(true)
    expect(celdaDe('2026-07-03').vacacion).toBe(true)
    expect(celdaDe('2026-07-06').vacacion).toBe(false)
  })
  it('marca un festivo con su motivo', () => {
    expect(celdaDe('2026-07-25').festivo).toBe('Santiago Apóstol')
  })
  it('marca los días de cierre semanal', () => {
    expect(celdaDe('2026-07-04').cerrado).toBe(true)  // sábado
    expect(celdaDe('2026-07-01').cerrado).toBe(false) // miércoles
  })
  it('señala el día de hoy y los días fuera del mes', () => {
    expect(celdaDe('2026-07-15').esHoy).toBe(true)
    expect(celdaDe('2026-06-29').enMes).toBe(false)
    expect(celdaDe('2026-07-01').enMes).toBe(true)
  })
})
