'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { getAvailableSlots } from '@/lib/availability'
import { calcularPrecioReserva } from '@/lib/pricing'
import { buscarOCrearCliente } from '@/lib/customers'
import { enviarEmailsReserva } from '@/lib/booking-emails'
import { crearCheckoutSession } from '@/lib/stripe'
import { resend, emailFrom } from '@/lib/resend'
import { buildEmail, escapeHtml } from '@/lib/email'
import { parseBookingForm } from '@/lib/schemas/booking'

export async function crearReserva(prevState, formData) {
  // Validación declarativa con Zod — schema en lib/schemas/booking.js.
  // Reutilizable desde otros canales (API directa, integraciones) en el SaaS.
  const parsed = parseBookingForm(formData)
  if (!parsed.ok) return { error: parsed.error }

  const {
    service_id,
    vehicle_type,
    customer_name,
    license_plate,
    customer_email,
    customer_phone,
    date,
    time_slot,
    payment_method: paymentMethod,
  } = parsed.data

  const supabase = await createClient()
  const db = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Resolver tenant por slug — el form de reserva pasa business_id como campo oculto.
  // Usamos el ID directamente (ya validado al cargar la página por slug).
  const businessId = formData.get('business_id')
  const slug = formData.get('slug')
  if (!businessId || !slug) return { error: 'Error interno. Inténtalo más tarde.' }

  const { data: settings } = await db
    .from('business_settings')
    .select('min_booking_notice_hours, advance_payment_discount, cash_payment_discount')
    .eq('business_id', businessId)
    .single()

  const noticeHours = settings?.min_booking_notice_hours ?? 24
  const cutoff = new Date(Date.now() + noticeHours * 60 * 60 * 1000)
  if (new Date(`${date}T${time_slot}:00`) < cutoff) {
    return { error: `Las reservas deben hacerse con al menos ${noticeHours} horas de antelación.` }
  }

  const { slots, blocked, closed } = await getAvailableSlots(date, businessId, service_id)
  if (blocked || closed) return { error: 'Este día no está disponible para reservas.' }
  if (!slots.includes(time_slot)) return { error: 'Esta hora ya no está disponible. Elige otra.' }

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('name, price, vehicle_pricing')
    .eq('id', service_id)
    .eq('active', true)
    .single()
  if (serviceError || !service) return { error: 'Servicio no encontrado.' }

  const { finalPrice, discountAmount, discountPct } = calcularPrecioReserva(service, vehicle_type, settings, paymentMethod)

  // Para pago local calculamos el cliente antes de la RPC para enlazarlo desde el INSERT.
  // Para Stripe se calcula en el webhook (tras confirmar el pago) y se hace UPDATE.
  const customerId = paymentMethod === 'local'
    ? await buscarOCrearCliente(customer_email, customer_phone, customer_name, businessId, db)
    : null

  // RPC atómica: cuenta solapamientos e inserta dentro de una transacción.
  // Si entre getAvailableSlots y aquí otro cliente metió una reserva en este
  // slot, la RPC lanza slot_full y devolvemos el mismo mensaje que la
  // validación previa.
  const { data: bookingId, error: bookingError } = await db.rpc('crear_booking_atomico', {
    p_business_id:      businessId,
    p_service_id:       service_id,
    p_customer_name:    customer_name,
    p_license_plate:    license_plate,
    p_customer_email:   customer_email,
    p_customer_phone:   customer_phone,
    p_date:             date,
    p_time_slot:        time_slot,
    p_price:            finalPrice,
    p_vehicle_type:     vehicle_type,
    p_discount_percent: discountPct > 0 ? discountPct : null,
    p_discount_amount:  discountPct > 0 ? discountAmount : null,
    p_status:           paymentMethod === 'local' ? 'confirmado' : 'pendiente',
    p_customer_id:      customerId,
  })
  if (bookingError) {
    if (bookingError.message?.includes('slot_full')) {
      return { error: 'Esta hora ya no está disponible. Elige otra.' }
    }
    return { error: 'No se pudo crear la reserva. Inténtalo de nuevo.' }
  }
  const booking = { id: bookingId }

  // ── PAGO EN LOCAL ──────────────────────────────────────────
  if (paymentMethod === 'local') {

    await db.from('service_records').insert({
      business_id: businessId,
      service_id,
      customer_id: customerId,
      date,
      price:       finalPrice,
      status:      'pendiente',
      is_paid:     false,
      booking_id:  booking.id,
      notes:       `Reserva local · ${customer_name} · ${license_plate} · ${String(time_slot).slice(0, 5)}`,
    })

    await enviarEmailsReserva({
      db, businessId,
      customerName:  customer_name,
      customerEmail: customer_email,
      licensePlate:  license_plate,
      date,
      hora:          String(time_slot).slice(0, 5),
      serviceName:   service.name,
      finalPrice,
      discountPct,
      paymentMethod,
    })

    redirect(`/app/${slug}/reservar/confirmado?tipo=local`)
  }

  // ── PAGO ONLINE (STRIPE) ───────────────────────────────────
  const productDescription = discountPct > 0
    ? `${date} a las ${time_slot} · ${license_plate} · ${discountPct}% dto. pago adelantado`
    : `${date} a las ${time_slot} · ${license_plate}`

  const session = await crearCheckoutSession({
    serviceName:   service.name,
    description:   productDescription,
    amountCents:   Math.round(finalPrice * 100),
    customerEmail: customer_email,
    successUrl:    `${process.env.NEXT_PUBLIC_SITE_URL}/app/${slug}/reservar/confirmado?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl:     `${process.env.NEXT_PUBLIC_SITE_URL}/app/${slug}/reservar`,
    metadata:      { booking_id: booking.id },
  })

  await db
    .from('bookings')
    .update({ stripe_session_id: session.id })
    .eq('id', booking.id)

  // Email de recuperación del carrito — permite retomar el pago si se corta la conexión.
  // La sesión de Stripe expira en 30 minutos; lo indicamos en el email.
  if (customer_email && resend) {
    const { data: business } = await db
      .from('businesses')
      .select('name, address, phone, email')
      .eq('id', businessId)
      .single()
    const hora = String(time_slot).slice(0, 5)
    resend.emails.send({
      from: emailFrom(business),
      to: customer_email,
      subject: `Completa tu reserva — ${service.name} · ${date} a las ${hora}`,
      html: buildEmail({
        title: 'Tu reserva está pendiente de pago',
        intro: `Hola <strong>${escapeHtml(customer_name)}</strong>, ya tienes tu cita reservada. Solo falta completar el pago para confirmarla.`,
        rows: [
          ['Servicio',  service.name],
          ['Fecha',     `${date} a las ${hora}`],
          ['Matrícula', license_plate],
          ['Total',     `${finalPrice} €`],
        ],
        outro: `<a href="${session.url}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#C9A84C;color:#0A0E14;font-weight:700;font-size:15px;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">Completar pago →</a><br><br><span style="font-size:12px;color:#9ca3af;">Este enlace caduca en 30 minutos. Si ya has completado el pago ignora este email.</span>`,
        business,
      }),
    }).catch(() => {}) // no bloquear el redirect si el email falla
  }

  redirect(session.url)
}
