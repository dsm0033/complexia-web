import { describe, it, expect } from 'vitest'
import { normalizePhoneDigits, telHref, waHref, mapsEmbedUrl, fullAddress } from './business-contact'

describe('normalizePhoneDigits', () => {
  it('añade prefijo 34 a números españoles de 9 cifras', () => {
    expect(normalizePhoneDigits('607445305')).toBe('34607445305')
  })

  it('respeta números que ya llevan prefijo', () => {
    expect(normalizePhoneDigits('+34 607 445 305')).toBe('34607445305')
    expect(normalizePhoneDigits('34607445305')).toBe('34607445305')
  })

  it('limpia espacios, guiones y paréntesis', () => {
    expect(normalizePhoneDigits('607-44-53-05')).toBe('34607445305')
    expect(normalizePhoneDigits('(607) 445 305')).toBe('34607445305')
  })

  it('devuelve null sin teléfono utilizable', () => {
    expect(normalizePhoneDigits(null)).toBeNull()
    expect(normalizePhoneDigits('')).toBeNull()
    expect(normalizePhoneDigits('sin teléfono')).toBeNull()
  })
})

describe('telHref', () => {
  it('construye el enlace tel: con +', () => {
    expect(telHref('607 445 305')).toBe('tel:+34607445305')
  })

  it('devuelve null sin teléfono', () => {
    expect(telHref(null)).toBeNull()
  })
})

describe('waHref', () => {
  it('construye el enlace de WhatsApp sin mensaje', () => {
    expect(waHref('607445305')).toBe('https://wa.me/34607445305')
  })

  it('codifica el mensaje en el query', () => {
    expect(waHref('607445305', 'Hola, quiero cita.')).toBe(
      'https://wa.me/34607445305?text=Hola%2C%20quiero%20cita.'
    )
  })

  it('devuelve null sin teléfono', () => {
    expect(waHref(null, 'Hola')).toBeNull()
  })
})

describe('fullAddress', () => {
  it('compone dirección completa con CP, ciudad y provincia', () => {
    expect(fullAddress({
      address: 'C. Palmilla, 28',
      postal_code: '11540',
      city: 'Sanlúcar de Barrameda',
      province: 'Cádiz',
    })).toBe('C. Palmilla, 28, 11540 Sanlúcar de Barrameda, Cádiz')
  })

  it('tolera campos ausentes', () => {
    expect(fullAddress({ address: 'C. Palmilla, 28' })).toBe('C. Palmilla, 28')
    expect(fullAddress({ address: 'C. Palmilla, 28', city: 'Sanlúcar' }))
      .toBe('C. Palmilla, 28, Sanlúcar')
    expect(fullAddress({ city: 'Sanlúcar', province: 'Cádiz' }))
      .toBe('Sanlúcar, Cádiz')
  })

  it('devuelve null sin ningún dato', () => {
    expect(fullAddress(null)).toBeNull()
    expect(fullAddress({})).toBeNull()
  })
})

describe('mapsEmbedUrl', () => {
  it('codifica la dirección en la URL de embed', () => {
    expect(mapsEmbedUrl('C. Palmilla, 28, Sanlúcar')).toBe(
      'https://www.google.com/maps?q=C.%20Palmilla%2C%2028%2C%20Sanl%C3%BAcar&output=embed&hl=es&z=16'
    )
  })

  it('devuelve null sin dirección', () => {
    expect(mapsEmbedUrl(null)).toBeNull()
  })
})
