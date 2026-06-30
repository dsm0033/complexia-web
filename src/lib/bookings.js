// Criterio único de "reserva activa", compartido por:
//   - getAvailableSlots (lib/availability.js): qué slots ocupa una reserva
//   - bloquearFecha (admin/configuracion/reservas/actions.js): si un día tiene reservas
//   - panel de reservas (admin/reservas/page.js): qué reservas mostrar vs. abandonadas
//
// Antes cada sitio definía "activa" a su manera y divergían: el panel ocultaba
// las pendientes viejas como "abandonadas" (carritos de pago nunca completados),
// pero el bloqueo de días y la disponibilidad seguían contándolas, dando errores
// del tipo "hay 1 reserva activa" en días que el admin veía vacíos.
//
// Una reserva online se crea como 'pendiente' antes de ir a Stripe. Si el cliente
// no paga, Stripe expira la sesión (~24h por defecto) y el webhook
// checkout.session.expired la marca como 'cancelado'. Hasta entonces queda
// 'pendiente'; si el webhook no llega (p. ej. sesiones de prueba antiguas) la fila
// se queda colgada para siempre. Por eso, además de excluir las canceladas,
// tratamos como inactivas las pendientes con más de PENDIENTE_ABANDONO_MS.

// Ventana tras la que una reserva 'pendiente' sin pagar se considera abandonada.
// Coincide con expires_at de la sesión de Stripe (lib/stripe.js): al expirar, el
// webhook checkout.session.expired marca la reserva 'cancelado'. Esta ventana es
// la red de seguridad si ese webhook no llegara, para no retener el slot más de
// lo que dura la sesión de pago.
export const PENDIENTE_ABANDONO_MS = 30 * 60 * 1000 // 30 minutos

// ¿Sigue viva esta reserva? (cuenta para disponibilidad y para bloquear el día)
export function esReservaActiva(booking, now = Date.now()) {
  if (!booking || booking.status === 'cancelado') return false
  if (booking.status === 'pendiente') {
    if (!booking.created_at) return true // sin fecha fiable → no la descartamos
    const createdMs = new Date(booking.created_at).getTime()
    if (Number.isNaN(createdMs)) return true
    return now - createdMs < PENDIENTE_ABANDONO_MS
  }
  return true
}

// Inverso: pendiente que ya superó la ventana de pago (carrito abandonado).
export function esReservaAbandonada(booking, now = Date.now()) {
  return booking?.status === 'pendiente' && !esReservaActiva(booking, now)
}
