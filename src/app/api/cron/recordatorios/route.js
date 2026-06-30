import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'
import { buildEmail, escapeHtml, formatearFecha } from '@/lib/email'
import { resend, emailFrom, DEFAULT_FROM_EMAIL } from '@/lib/resend'

// Vercel invoca este endpoint con Authorization: Bearer <CRON_SECRET>
export async function GET(request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!resend) {
    return new Response('RESEND_API_KEY not set', { status: 200 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Calcular fecha de mañana en YYYY-MM-DD
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  // Reservas confirmadas/pagadas de mañana con email y sin recordatorio enviado
  const { data: bookings, error } = await admin
    .from('bookings')
    .select('id, customer_name, customer_email, date, time_slot, business_id, services(name)')
    .eq('date', tomorrowStr)
    .eq('reminder_sent', false)
    .not('customer_email', 'is', null)
    .in('status', ['confirmado', 'pagado'])

  if (error) {
    Sentry.captureException(error, {
      tags: { event: 'cron_recordatorios_query_failed', source: 'cron_recordatorios' },
      extra: { tomorrow: tomorrowStr },
    })
    console.error({
      event: 'cron_recordatorios_query_failed',
      source: 'cron_recordatorios',
      tomorrow: tomorrowStr,
      error: error.message,
    })
    return new Response('DB error', { status: 500 })
  }

  if (!bookings?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  // Agrupar por business_id para no pedir la empresa N veces
  const businessIds = [...new Set(bookings.map(b => b.business_id))]
  const businessMap = {}
  for (const bid of businessIds) {
    const { data } = await admin
      .from('businesses')
      .select('name, address, phone, email')
      .eq('id', bid)
      .single()
    if (data) businessMap[bid] = data
  }

  let sent = 0
  const sentIds = []

  for (const booking of bookings) {
    const business = businessMap[booking.business_id]
    const hora = String(booking.time_slot).slice(0, 5)
    const from = emailFrom(business)

    try {
      await resend.emails.send({
        from,
        to: booking.customer_email,
        subject: `Recordatorio: tu cita es mañana a las ${hora}`,
        html: buildEmail({
          title: 'Recordatorio de cita',
          intro: `Hola <strong>${escapeHtml(booking.customer_name)}</strong>, te recordamos que mañana tienes una cita con nosotros.`,
          rows: [
            ['Servicio', booking.services?.name ?? 'Servicio'],
            ['Fecha',    `${formatearFecha(booking.date)} a las ${hora}`],
          ],
          outro: `¿Necesitas cancelar o cambiar la cita? Contáctanos en <a href="mailto:${business?.email ?? DEFAULT_FROM_EMAIL}" style="color:#C9A84C;">${business?.email ?? DEFAULT_FROM_EMAIL}</a>`,
          business,
        }),
      })
      sentIds.push(booking.id)
      sent++
    } catch (err) {
      Sentry.captureException(err, {
        tags: { event: 'cron_recordatorio_send_failed', source: 'cron_recordatorios' },
        extra: { bookingId: booking.id, customerEmail: booking.customer_email, date: booking.date },
      })
      console.error({
        event: 'cron_recordatorio_send_failed',
        source: 'cron_recordatorios',
        bookingId: booking.id,
        customerEmail: booking.customer_email,
        date: booking.date,
        error: err.message,
      })
    }
  }

  // Marcar como enviados
  if (sentIds.length) {
    await admin
      .from('bookings')
      .update({ reminder_sent: true })
      .in('id', sentIds)
  }

  return new Response(JSON.stringify({ sent }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
