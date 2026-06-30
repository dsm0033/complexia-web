'use client'

import { useActionState, useState, useEffect } from 'react'
import { crearReserva } from '@/app/actions/booking'

const VEHICLE_TYPES = [
  { key: 'turismo_pequeno', label: 'Turismo pequeño', hint: 'Polo, Ibiza, 208...' },
  { key: 'turismo',         label: 'Turismo',         hint: 'Golf, León, 308...' },
  { key: 'suv',             label: 'SUV / 4x4 / Berlina / Sportwagon', hint: 'Tiguan, RAV4, Passat, A6, Serie 5...' },
  { key: 'furgoneta',       label: 'Furgoneta',       hint: 'Transporter, Transit...' },
]

function getVehiclePrice(service, vehicleType) {
  if (!service) return null
  const vp = service.vehicle_pricing ?? {}
  return vp[vehicleType] ?? service.price
}

function getMinPrice(service) {
  if (!service) return null
  const vals = Object.values(service.vehicle_pricing ?? {}).filter(v => typeof v === 'number' && v > 0)
  return vals.length ? Math.min(...vals) : service.price
}

export default function BookingForm({ services, advanceDays = 60, discountPct = 0, cashDiscountPct = 0, noticeHours = 24, userEmail = null, userName = null, defaultServiceId = null }) {
  const [state, action, pending] = useActionState(crearReserva, undefined)
  const [selectedServiceId, setSelectedServiceId] = useState(defaultServiceId)
  const [selectedVehicleType, setSelectedVehicleType] = useState(null)
  const [paymentMode, setPaymentMode] = useState('stripe')

  const selectedService = services.find(s => s.id === selectedServiceId) ?? null
  const vehiclePrice = getVehiclePrice(selectedService, selectedVehicleType)
  const finalPrice = vehiclePrice
    ? paymentMode === 'stripe' && discountPct > 0
      ? Number((vehiclePrice * (1 - discountPct / 100)).toFixed(2))
      : paymentMode === 'local' && cashDiscountPct > 0
        ? Number((vehiclePrice * (1 - cashDiscountPct / 100)).toFixed(2))
        : vehiclePrice
    : vehiclePrice

  const minDate = new Date(Date.now() + noticeHours * 60 * 60 * 1000).toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + advanceDays * 86400000).toISOString().split('T')[0]

  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotMessage, setSlotMessage] = useState('')
  const [emailBlurred, setEmailBlurred] = useState(false)
  const [emailValue, setEmailValue] = useState(userEmail ?? '')

  useEffect(() => {
    if (!date) { setSlots([]); setSlotMessage(''); return }
    setSlotsLoading(true)
    setSlotMessage('')
    const params = new URLSearchParams({ date })
    if (selectedServiceId) params.set('service', selectedServiceId)
    fetch(`/api/slots?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.blocked || data.closed) {
          setSlots([])
          setSlotMessage('No hay disponibilidad para este día.')
        } else if (!data.slots?.length) {
          setSlots([])
          setSlotMessage('No quedan horas libres para este día.')
        } else {
          setSlots(data.slots)
          setSlotMessage('')
        }
      })
      .catch(() => { setSlots([]); setSlotMessage('Error al cargar horarios.') })
      .finally(() => setSlotsLoading(false))
  }, [date, selectedServiceId])

  return (
    <form action={action} className="space-y-8">

      {/* 1. Servicio */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          1. Elige tu servicio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map(s => {
            const minP = getMinPrice(s)
            return (
              <label
                key={s.id}
                className="relative flex flex-col gap-1 p-4 rounded-xl border-2 border-gray-200 cursor-pointer transition-colors hover:border-blue-400 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
              >
                <input
                  type="radio"
                  name="service_id"
                  value={s.id}
                  required
                  className="sr-only"
                  checked={selectedServiceId === s.id}
                  onChange={() => { setSelectedServiceId(s.id); setSelectedVehicleType(null) }}
                />
                <span className="font-semibold text-gray-900">{s.name}</span>
                {s.description && (
                  <span className="text-xs text-gray-500 line-clamp-2">{s.description}</span>
                )}
                <span className="mt-1 text-lg font-bold text-blue-600">
                  {minP != null ? `desde ${minP}€` : '—'}
                </span>
                {s.duration_minutes && (
                  <span className="text-xs text-gray-400">{s.duration_minutes} min</span>
                )}
              </label>
            )
          })}
        </div>
      </section>

      {/* 2. Tipo de vehículo */}
      {selectedService && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            2. Tipo de vehículo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VEHICLE_TYPES.map(v => {
              const price = getVehiclePrice(selectedService, v.key)
              const discounted = (discountPct > 0 && paymentMode === 'stripe')
                ? Number((price * (1 - discountPct / 100)).toFixed(2))
                : (cashDiscountPct > 0 && paymentMode === 'local')
                  ? Number((price * (1 - cashDiscountPct / 100)).toFixed(2))
                  : null
              return (
                <label
                  key={v.key}
                  className="relative flex flex-col gap-0.5 p-4 rounded-xl border-2 border-gray-200 cursor-pointer transition-colors hover:border-blue-400 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="vehicle_type"
                    value={v.key}
                    required
                    className="sr-only"
                    onChange={() => setSelectedVehicleType(v.key)}
                  />
                  <span className="font-semibold text-gray-900">{v.label}</span>
                  <span className="text-xs text-gray-400">{v.hint}</span>
                  {discounted != null ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400 line-through">{price}€</span>
                      <span className="text-lg font-bold text-blue-600">{discounted}€</span>
                    </div>
                  ) : (
                    <span className="mt-1 text-lg font-bold text-blue-600">{price}€</span>
                  )}
                </label>
              )
            })}
          </div>
        </section>
      )}

      {/* 3. Fecha y hora */}
      {selectedVehicleType && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            3. Fecha y hora
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                min={minDate}
                max={maxDate}
                value={date}
                onChange={e => setDate(e.target.value)}
                onClick={e => e.currentTarget.showPicker?.()}
                onFocus={e => e.currentTarget.showPicker?.()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="time_slot" className="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              {slotsLoading ? (
                <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50">
                  Comprobando disponibilidad…
                </div>
              ) : slotMessage ? (
                <div className="w-full px-3 py-2.5 border border-orange-200 bg-orange-50 rounded-lg text-sm text-orange-700">
                  {slotMessage}
                </div>
              ) : (
                <select
                  id="time_slot"
                  name="time_slot"
                  required
                  defaultValue=""
                  disabled={!slots.length}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="" disabled>
                    {date ? 'Selecciona una hora' : 'Primero elige una fecha'}
                  </option>
                  {slots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. Tus datos */}
      {selectedVehicleType && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            4. Tus datos
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                required
                defaultValue={userName ?? ''}
                placeholder="Tu nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700 mb-1">
                Matrícula
              </label>
              <input
                id="license_plate"
                name="license_plate"
                type="text"
                required
                placeholder="1234 ABC"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                required
                placeholder="600 000 000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email{' '}
                {userEmail
                  ? <span className="text-gray-400 font-normal">(para el recibo)</span>
                  : <span className="text-gray-400 font-normal">(recomendado — para el recibo)</span>
                }
              </label>
              <input
                id="customer_email"
                name="customer_email"
                type="email"
                value={emailValue}
                readOnly={!!userEmail}
                onChange={e => setEmailValue(e.target.value)}
                onBlur={() => setEmailBlurred(true)}
                placeholder="tu@email.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  userEmail ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                }`}
              />
              {!userEmail && emailBlurred && !emailValue && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>Sin email no podremos enviarte la confirmación ni el recibo. Te recomendamos añadirlo.</span>
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. Forma de pago */}
      {selectedVehicleType && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            5. Forma de pago
          </h2>
          <div className="space-y-3">
            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMode === 'stripe' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <input
                type="radio"
                name="payment_method"
                value="stripe"
                checked={paymentMode === 'stripe'}
                onChange={() => setPaymentMode('stripe')}
                className="mt-0.5 w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <span className="font-semibold text-gray-900 block">Pagar ahora online</span>
                <span className="text-xs text-gray-500">Tarjeta de crédito o débito · Pago seguro con Stripe</span>
                {discountPct > 0 && (
                  <span className="mt-1 inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    -{discountPct}% de descuento por pagar ahora
                  </span>
                )}
              </div>
            </label>

            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMode === 'local' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <input
                type="radio"
                name="payment_method"
                value="local"
                checked={paymentMode === 'local'}
                onChange={() => setPaymentMode('local')}
                className="mt-0.5 w-4 h-4 text-blue-600"
              />
              <div>
                <span className="font-semibold text-gray-900 block">Pagar en el local</span>
                <span className="text-xs text-gray-500">Efectivo o Bizum al llegar</span>
                {cashDiscountPct > 0 && (
                  <span className="mt-1 inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    -{cashDiscountPct}% de descuento por pagar en efectivo
                  </span>
                )}
              </div>
            </label>
          </div>
        </section>
      )}

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{state.error}</p>
      )}

      {selectedVehicleType && (
        <>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl text-base font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pending
              ? (paymentMode === 'local' ? 'Confirmando reserva...' : 'Redirigiendo al pago...')
              : paymentMode === 'local'
                ? cashDiscountPct > 0 && finalPrice != null
                  ? `Confirmar reserva · ${finalPrice}€ →`
                  : 'Confirmar reserva →'
                : finalPrice != null
                  ? `Reservar y pagar ${finalPrice}€ →`
                  : 'Reservar y pagar →'
            }
          </button>

          <p className="text-xs text-gray-400 text-center">
            Pago seguro procesado por Stripe. No almacenamos datos de tu tarjeta.
          </p>
        </>
      )}
    </form>
  )
}
