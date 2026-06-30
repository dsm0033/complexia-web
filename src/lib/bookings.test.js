import { describe, it, expect } from 'vitest'
import { esReservaActiva, esReservaAbandonada, PENDIENTE_ABANDONO_MS } from './bookings.js'

const now = new Date('2026-06-15T12:00:00Z').getTime()
const reciente = new Date(now - 10 * 60 * 1000).toISOString()        // hace 10 min (dentro de ventana)
const vieja    = new Date(now - 3 * 60 * 60 * 1000).toISOString()    // hace 3 h (carrito abandonado)

describe('esReservaActiva', () => {
  it('cancelado nunca está activa', () => {
    expect(esReservaActiva({ status: 'cancelado', created_at: reciente }, now)).toBe(false)
    expect(esReservaActiva({ status: 'cancelado', created_at: vieja }, now)).toBe(false)
  })

  it('pagado y confirmado siempre están activas', () => {
    expect(esReservaActiva({ status: 'pagado', created_at: vieja }, now)).toBe(true)
    expect(esReservaActiva({ status: 'confirmado', created_at: vieja }, now)).toBe(true)
  })

  it('pendiente reciente está activa', () => {
    expect(esReservaActiva({ status: 'pendiente', created_at: reciente }, now)).toBe(true)
  })

  it('pendiente más vieja que la ventana se considera abandonada (inactiva)', () => {
    expect(esReservaActiva({ status: 'pendiente', created_at: vieja }, now)).toBe(false)
  })

  it('justo en el límite de la ventana ya no está activa', () => {
    const limite = new Date(now - PENDIENTE_ABANDONO_MS).toISOString()
    expect(esReservaActiva({ status: 'pendiente', created_at: limite }, now)).toBe(false)
  })

  it('pendiente sin created_at fiable no se descarta', () => {
    expect(esReservaActiva({ status: 'pendiente', created_at: null }, now)).toBe(true)
  })

  it('null/undefined no está activa', () => {
    expect(esReservaActiva(null, now)).toBe(false)
    expect(esReservaActiva(undefined, now)).toBe(false)
  })
})

describe('esReservaAbandonada', () => {
  it('solo las pendientes viejas son abandonadas', () => {
    expect(esReservaAbandonada({ status: 'pendiente', created_at: vieja }, now)).toBe(true)
    expect(esReservaAbandonada({ status: 'pendiente', created_at: reciente }, now)).toBe(false)
    expect(esReservaAbandonada({ status: 'pagado', created_at: vieja }, now)).toBe(false)
    expect(esReservaAbandonada({ status: 'cancelado', created_at: vieja }, now)).toBe(false)
  })
})
