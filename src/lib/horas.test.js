import { describe, it, expect } from 'vitest'
import {
  startOfWeek,
  minutosEntreFechas,
  formatHoras,
  formatDiferencia,
  jsDayToEs,
  calcMinutos,
  agruparPorSemana,
} from './horas.js'

// Usa getters locales para evitar el desfase UTC (Spain = UTC+2)
function localDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('startOfWeek', () => {
  it('lunes devuelve el mismo día a medianoche local', () => {
    const lunes = new Date('2026-05-11T10:30:00') // lunes 11 Mayo
    const result = startOfWeek(lunes)
    expect(localDate(result)).toBe('2026-05-11')
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
  })

  it('miércoles devuelve el lunes de la misma semana', () => {
    const mierc = new Date('2026-05-13T15:00:00') // miércoles
    expect(localDate(startOfWeek(mierc))).toBe('2026-05-11')
  })

  it('domingo devuelve el lunes anterior (semana europea)', () => {
    const domingo = new Date('2026-05-10T09:00:00') // domingo
    expect(localDate(startOfWeek(domingo))).toBe('2026-05-04')
  })
})

describe('minutosEntreFechas', () => {
  it('calcula 60 minutos entre dos fechas separadas 1h', () => {
    expect(minutosEntreFechas('2026-05-11T09:00:00', '2026-05-11T10:00:00')).toBe(60)
  })

  it('calcula 90 minutos', () => {
    expect(minutosEntreFechas('2026-05-11T08:00:00', '2026-05-11T09:30:00')).toBe(90)
  })

  it('redondea al minuto más cercano', () => {
    expect(minutosEntreFechas('2026-05-11T09:00:00', '2026-05-11T09:00:30')).toBe(1)
    expect(minutosEntreFechas('2026-05-11T09:00:00', '2026-05-11T09:00:29')).toBe(0)
  })
})

describe('formatHoras', () => {
  it('0 o negativo → "0h"', () => {
    expect(formatHoras(0)).toBe('0h')
    expect(formatHoras(-30)).toBe('0h')
  })

  it('solo minutos (< 60)', () => {
    expect(formatHoras(30)).toBe('30min')
  })

  it('horas exactas', () => {
    expect(formatHoras(60)).toBe('1h')
    expect(formatHoras(480)).toBe('8h')
  })

  it('horas y minutos', () => {
    expect(formatHoras(90)).toBe('1h 30min')
    expect(formatHoras(125)).toBe('2h 5min')
  })
})

describe('formatDiferencia', () => {
  it('0 → null', () => {
    expect(formatDiferencia(0)).toBeNull()
  })

  it('positivo lleva +', () => {
    expect(formatDiferencia(60)).toBe('+1h')
    expect(formatDiferencia(90)).toBe('+1h 30min')
  })

  it('negativo lleva −', () => {
    expect(formatDiferencia(-60)).toBe('−1h')
    expect(formatDiferencia(-30)).toBe('−30min')
  })
})

describe('jsDayToEs', () => {
  it('domingo JS (0) → 6 en español', () => {
    expect(jsDayToEs(0)).toBe(6)
  })

  it('lunes JS (1) → 0 en español', () => {
    expect(jsDayToEs(1)).toBe(0)
  })

  it('sábado JS (6) → 5 en español', () => {
    expect(jsDayToEs(6)).toBe(5)
  })
})

describe('calcMinutos', () => {
  it('suma los minutos de todas las entradas con clock_out', () => {
    const entradas = [
      { clock_in: '2026-05-11T08:00:00', clock_out: '2026-05-11T09:00:00' },
      { clock_in: '2026-05-11T10:00:00', clock_out: '2026-05-11T10:30:00' },
    ]
    expect(calcMinutos(entradas, null)).toBe(90)
  })

  it('usa "ahora" cuando clock_out es null (empleado fichado)', () => {
    const inicio = '2026-05-11T08:00:00'
    const ahora  = '2026-05-11T09:30:00'
    const entradas = [{ clock_in: inicio, clock_out: null }]
    expect(calcMinutos(entradas, ahora)).toBe(90)
  })

  it('lista vacía → 0', () => {
    expect(calcMinutos([], null)).toBe(0)
  })
})

describe('agruparPorSemana', () => {
  it('agrupa entradas de la misma semana bajo el lunes', () => {
    const entradas = [
      { date: '2026-05-11', hours: 8 }, // lunes
      { date: '2026-05-13', hours: 7 }, // miércoles misma semana
      { date: '2026-05-18', hours: 8 }, // lunes siguiente semana
    ]
    const result = agruparPorSemana(entradas)
    const groups = Object.values(result)
    expect(groups).toHaveLength(2)
    // Los dos primeros comparten semana, el tercero va solo
    const sizes = groups.map(g => g.length).sort()
    expect(sizes).toEqual([1, 2])
  })

  it('lista vacía → objeto vacío', () => {
    expect(agruparPorSemana([])).toEqual({})
  })
})
