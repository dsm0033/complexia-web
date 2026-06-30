import { describe, it, expect } from 'vitest'
import { calcularPrecioReserva } from './pricing.js'

const settings = {
  advance_payment_discount: 10,
  cash_payment_discount: 5,
}

const servicioBase = { price: 100, vehicle_pricing: null }
const servicioConTipos = {
  price: 100,
  vehicle_pricing: { turismo: 80, suv: 120, furgoneta: 150 },
}

describe('calcularPrecioReserva', () => {
  describe('sin vehicle_pricing', () => {
    it('usa el precio base del servicio cuando no hay descuento', () => {
      const { finalPrice } = calcularPrecioReserva(servicioBase, 'turismo', {}, 'stripe')
      expect(finalPrice).toBe(100)
    })

    it('aplica descuento por pago online', () => {
      const { finalPrice, discountAmount, discountPct } = calcularPrecioReserva(servicioBase, 'turismo', settings, 'stripe')
      expect(discountPct).toBe(10)
      expect(discountAmount).toBe(10)
      expect(finalPrice).toBe(90)
    })

    it('aplica descuento por pago en local', () => {
      const { finalPrice, discountAmount, discountPct } = calcularPrecioReserva(servicioBase, 'turismo', settings, 'local')
      expect(discountPct).toBe(5)
      expect(discountAmount).toBe(5)
      expect(finalPrice).toBe(95)
    })
  })

  describe('con vehicle_pricing', () => {
    it('usa el precio del tipo de vehículo', () => {
      const { finalPrice } = calcularPrecioReserva(servicioConTipos, 'suv', {}, 'stripe')
      expect(finalPrice).toBe(120)
    })

    it('cae al precio base si el tipo de vehículo no está en la tabla', () => {
      const { finalPrice } = calcularPrecioReserva(servicioConTipos, 'moto', {}, 'stripe')
      expect(finalPrice).toBe(100)
    })

    it('aplica descuento sobre el precio del tipo', () => {
      const { finalPrice, discountAmount } = calcularPrecioReserva(servicioConTipos, 'furgoneta', settings, 'stripe')
      expect(discountAmount).toBe(15)
      expect(finalPrice).toBe(135)
    })
  })

  describe('sin descuento', () => {
    it('discountAmount = 0 cuando no hay configuración', () => {
      const { discountAmount, discountPct } = calcularPrecioReserva(servicioBase, 'turismo', {}, 'stripe')
      expect(discountPct).toBe(0)
      expect(discountAmount).toBe(0)
    })
  })

  describe('redondeo', () => {
    it('redondea a 2 decimales', () => {
      const servicio = { price: 33.33, vehicle_pricing: null }
      const cfg = { advance_payment_discount: 10 }
      const { finalPrice, discountAmount } = calcularPrecioReserva(servicio, 'turismo', cfg, 'stripe')
      expect(finalPrice).toBe(29.997 < 30 ? 30 : finalPrice)
      expect(Number.isInteger(finalPrice * 100)).toBe(true)
      expect(Number.isInteger(discountAmount * 100)).toBe(true)
    })
  })
})
