export function calcularPrecioReserva(service, vehicleType, settings, paymentMethod) {
  const originalPrice = (service.vehicle_pricing ?? {})[vehicleType] ?? service.price
  const discountPct = paymentMethod === 'local'
    ? (settings?.cash_payment_discount ?? 0)
    : (settings?.advance_payment_discount ?? 0)
  const discountAmount = discountPct > 0
    ? Number((originalPrice * discountPct / 100).toFixed(2))
    : 0
  return {
    finalPrice: Number((originalPrice - discountAmount).toFixed(2)),
    discountAmount,
    discountPct,
  }
}
