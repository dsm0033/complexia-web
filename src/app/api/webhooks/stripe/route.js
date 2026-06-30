import * as Sentry from '@sentry/nextjs'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { resend, emailFrom, DEFAULT_FROM_EMAIL } from '@/lib/resend'
import { crearFacturaAutomatica } from '@/lib/invoices'
import { buscarOCrearCliente } from '@/lib/customers'
import { buildEmail, escapeHtml, formatearFecha } from '@/lib/email'
import { verifyWebhookSignature } from '@/lib/stripe'

export async function POST(request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  let event
  try {
    event = verifyWebhookSignature(body, signature)
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object
    const bookingId = session.metadata?.booking_id
    if (bookingId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      await supabase
        .from('bookings')
        .update({ status: 'cancelado' })
        .eq('id', bookingId)
        .eq('status', 'pendiente')
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bookingId = session.metadata?.booking_id

    if (bookingId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      // Obtener datos completos de la reserva
      const { data: booking } = await supabase
        .from('bookings')
        .select('*, services(name)')
        .eq('id', bookingId)
        .single()

      await supabase
        .from('bookings')
        .update({ status: 'pagado' })
        .eq('id', bookingId)

      // Crear registro en el historial como Pendiente para que el admin asigne empleado
      if (booking) {
        const customerId = await buscarOCrearCliente(
          booking.customer_email,
          booking.customer_phone,
          booking.customer_name,
          booking.business_id,
          supabase,
        )

        // Enlaza la reserva con el cliente ahora que tenemos el ID
        if (customerId) {
          await supabase
            .from('bookings')
            .update({ customer_id: customerId })
            .eq('id', bookingId)
        }

        await supabase
          .from('service_records')
          .upsert({
            business_id:    booking.business_id,
            service_id:     booking.service_id,
            customer_id:    customerId,
            date:           booking.date,
            price:          booking.price,
            status:         'pendiente',
            is_paid:        true,
            payment_method: 'stripe',
            booking_id:     bookingId,
            notes:          `Reserva online · ${booking.customer_name} · ${booking.license_plate} · ${String(booking.time_slot).slice(0, 5)}`,
          }, { onConflict: 'booking_id', ignoreDuplicates: true })

        // Factura automática para pagos online
        const { data: serviceRecord } = await supabase
          .from('service_records')
          .select('id')
          .eq('booking_id', bookingId)
          .maybeSingle()

        if (serviceRecord) {
          crearFacturaAutomatica({
            businessId:    booking.business_id,
            serviceRecordId: serviceRecord.id,
            totalAmount:   booking.price,
            itemDate:      booking.date,
            serviceName:   booking.services?.name ?? 'Servicio',
            customerId,
            customerName:  booking.customer_name,
            customerEmail: booking.customer_email,
          }).catch(err => {
            Sentry.captureException(err, {
              tags: { event: 'invoice_create_failed', source: 'stripe_webhook' },
              extra: { bookingId, businessId: booking.business_id },
            })
            console.error({
              event: 'invoice_create_failed',
              source: 'stripe_webhook',
              bookingId,
              businessId: booking.business_id,
              error: err.message,
            })
          })
        }
      }

      // Enviar emails si Resend está configurado
      if (resend && booking) {
        const { data: business } = await supabase
          .from('businesses')
          .select('name, address, phone, email')
          .eq('id', booking.business_id)
          .single()

        const serviceName = booking.services?.name ?? 'Servicio'
        const fecha = booking.date
        const hora  = String(booking.time_slot).slice(0, 5)
        const fechaTexto = `${formatearFecha(fecha)} a las ${hora}`
        const from  = emailFrom(business)

        await resend.emails.send({
          from,
          to: business?.email ?? DEFAULT_FROM_EMAIL,
          subject: `Nueva reserva — ${booking.customer_name} · ${fechaTexto}`,
          html: buildEmail({
            title: 'Nueva reserva confirmada',
            rows: [
              ['Cliente',       booking.customer_name],
              ['Servicio',      serviceName],
              ['Fecha',         fechaTexto],
              ['Matrícula',     booking.license_plate],
              ['Total cobrado', `${booking.price} €`],
            ],
            business,
          }),
        })

        if (booking.customer_email) {
          await resend.emails.send({
            from,
            to: booking.customer_email,
            subject: `Reserva confirmada — ${fechaTexto}`,
            html: buildEmail({
              title: '¡Tu reserva está confirmada!',
              intro: `Hola <strong>${escapeHtml(booking.customer_name)}</strong>, te esperamos el <strong>${fechaTexto}</strong>.`,
              rows: [
                ['Servicio',     serviceName],
                ['Matrícula',    booking.license_plate],
                ['Total pagado', `${booking.price} €`],
              ],
              outro: `¿Tienes alguna duda? Escríbenos a <a href="mailto:${business?.email ?? DEFAULT_FROM_EMAIL}" style="color:#C9A84C;">${business?.email ?? DEFAULT_FROM_EMAIL}</a>`,
              business,
            }),
          })
        }
      }
    }
  }

  return new Response('ok', { status: 200 })
}
