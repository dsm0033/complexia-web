import { describe, it, expect } from 'vitest'
import { generateSlots, jsDayToSpanish } from './availability.js'

describe('generateSlots', () => {
  it('genera slots cada 60 min entre apertura y cierre sin pausa', () => {
    const slots = generateSlots('09:00', '14:00', null, null, 60)
    expect(slots).toEqual(['09:00', '10:00', '11:00', '12:00', '13:00'])
  })

  it('slots de 30 min', () => {
    const slots = generateSlots('09:00', '11:00', null, null, 30)
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30'])
  })

  it('excluye el slot que empieza durante la pausa', () => {
    // Horario 09:00-18:00, comida 14:00-15:00, slots de 60 min
    const slots = generateSlots('09:00', '18:00', '14:00', '15:00', 60)
    expect(slots).not.toContain('14:00') // empieza exactamente en la comida → excluido
    expect(slots).toContain('13:00')     // 13:00-14:00 termina cuando empieza la comida → incluido
    expect(slots).toContain('15:00')     // primera slot después de la comida → incluido
    expect(slots).toContain('09:00')
  })

  it('excluye slots que empiezan antes de la comida pero terminan durante ella', () => {
    // Pausa 13:30-14:30, slots de 60 min (incrementos horarios: 09,10,11,12,13,14,15…)
    // 13:00-14:00 solapa con pausa 13:30-14:30 → excluido
    // 14:00-15:00 cae dentro de la pausa → excluido
    // 15:00 es la primera slot libre
    const slots = generateSlots('09:00', '18:00', '13:30', '14:30', 60)
    expect(slots).not.toContain('13:00')
    expect(slots).not.toContain('14:00')
    expect(slots).toContain('15:00')
  })

  it('devuelve [] si el horario es menor que slotDuration', () => {
    const slots = generateSlots('09:00', '09:30', null, null, 60)
    expect(slots).toEqual([])
  })

  it('genera slots en formato HH:MM con padding correcto', () => {
    const slots = generateSlots('09:00', '10:00', null, null, 60)
    expect(slots[0]).toMatch(/^\d{2}:\d{2}$/)
  })
})

describe('jsDayToSpanish', () => {
  it('domingo JS (0) → 6', () => {
    expect(jsDayToSpanish(0)).toBe(6)
  })

  it('lunes JS (1) → 0', () => {
    expect(jsDayToSpanish(1)).toBe(0)
  })

  it('sábado JS (6) → 5', () => {
    expect(jsDayToSpanish(6)).toBe(5)
  })

  it('todos los días son válidos (0-6 → 0-6)', () => {
    for (let d = 0; d <= 6; d++) {
      const result = jsDayToSpanish(d)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(6)
    }
  })
})
