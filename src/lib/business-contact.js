// ============================================
// 📞 DATOS DE CONTACTO DEL TENANT
// ============================================
// Helpers para construir enlaces tel:/WhatsApp/mapa a partir
// de los datos que el admin guarda en la tabla `businesses`
// (panel → Configuración → Empresa). Sustituyen a los números
// y direcciones hardcodeados heredados del repo single-tenant.

/**
 * Normaliza un teléfono a solo dígitos con prefijo de país.
 * Números españoles de 9 cifras reciben el prefijo 34.
 * Devuelve null si no hay teléfono utilizable.
 */
export function normalizePhoneDigits(phone) {
  if (!phone) return null
  const digits = String(phone).replace(/\D/g, '')
  if (!digits) return null
  return digits.length === 9 ? `34${digits}` : digits
}

/** Enlace `tel:+34...` o null si no hay teléfono. */
export function telHref(phone) {
  const digits = normalizePhoneDigits(phone)
  return digits ? `tel:+${digits}` : null
}

/** Enlace de WhatsApp con mensaje opcional, o null si no hay teléfono. */
export function waHref(phone, text) {
  const digits = normalizePhoneDigits(phone)
  if (!digits) return null
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${query}`
}

/** URL de embed de Google Maps para una dirección, o null si no hay. */
export function mapsEmbedUrl(address) {
  if (!address) return null
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=es&z=16`
}

/**
 * Compone la dirección completa del negocio:
 * "C. Palmilla, 28, 11540 Sanlúcar de Barrameda, Cádiz".
 * Tolera campos ausentes (si solo hay `address`, devuelve `address`),
 * así los llamadores que aún no seleccionan las columnas nuevas no rompen.
 */
export function fullAddress(business) {
  if (!business) return null
  const cpCity = [business.postal_code, business.city].filter(Boolean).join(' ')
  const parts = [business.address, cpCity, business.province].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}
