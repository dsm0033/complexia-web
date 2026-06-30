import { buildEmail, escapeHtml, formatearFecha } from '@/lib/email'
import { resend, emailFrom, DEFAULT_FROM_EMAIL } from '@/lib/resend'

export async function enviarEmailsReserva({
  db, businessId,
  customerName, customerEmail, licensePlate,
  date, hora, serviceName,
  finalPrice, discountPct, paymentMethod,
}) {
  if (!resend) return

  const { data: business } = await db
    .from('businesses')
    .select('name, address, phone, email')
    .eq('id', businessId)
    .single()

  const from = emailFrom(business)
  const esLocal = paymentMethod === 'local'
  const precioLabel = `${finalPrice} €${discountPct > 0 ? ` (${discountPct}% dto. ${esLocal ? 'efectivo' : 'pago adelantado'})` : ''}`
  const fechaTexto = `${formatearFecha(date)} a las ${hora}`

  // Los dos envíos (negocio + cliente) son independientes → en paralelo.
  const envios = [
    resend.emails.send({
      from,
      to: business?.email ?? DEFAULT_FROM_EMAIL,
      subject: `Nueva reserva (pago en ${esLocal ? 'local' : 'online'}) — ${customerName} · ${fechaTexto}`,
      html: buildEmail({
        title: `Nueva reserva — pago en ${esLocal ? 'local' : 'online'}`,
        rows: [
          ['Cliente',   customerName],
          ['Servicio',  serviceName],
          ['Fecha',     fechaTexto],
          ['Matrícula', licensePlate],
          ['Precio',    `${precioLabel}${esLocal ? ' (pendiente de cobro)' : ''}`],
        ],
        business,
      }),
    }),
  ]

  if (customerEmail) {
    envios.push(resend.emails.send({
      from,
      to: customerEmail,
      subject: `Reserva confirmada — ${fechaTexto}`,
      html: buildEmail({
        title: '¡Tu reserva está confirmada!',
        intro: `Hola <strong>${escapeHtml(customerName)}</strong>, te esperamos el <strong>${fechaTexto}</strong>.`,
        rows: [
          ['Servicio',  serviceName],
          ['Matrícula', licensePlate],
          ['Precio',    `${precioLabel}${esLocal ? ' (pago en el local)' : ''}`],
        ],
        outro: `¿Tienes alguna duda? Escríbenos a <a href="mailto:${business?.email ?? DEFAULT_FROM_EMAIL}" style="color:#C9A84C;">${business?.email ?? DEFAULT_FROM_EMAIL}</a>`,
        business,
      }),
    }))
  }

  await Promise.all(envios)
}

// Aviso al cliente de que su reserva ha sido cancelada por el negocio.
// Si pagó online (pagadoOnline), el email avisa de que se le reembolsará en su
// mismo método de pago. OJO: el reembolso se ejecuta manualmente en Stripe;
// el correo lo anuncia pero no lo dispara.
export async function enviarEmailCancelacion({
  db, businessId,
  customerName, customerEmail, licensePlate,
  date, hora, serviceName, pagadoOnline = false,
}) {
  if (!resend || !customerEmail) return

  const { data: business } = await db
    .from('businesses')
    .select('name, address, phone, email')
    .eq('id', businessId)
    .single()

  const contacto = business?.email ?? DEFAULT_FROM_EMAIL
  const fechaTexto = `${formatearFecha(date)} a las ${hora}`

  await resend.emails.send({
    from: emailFrom(business),
    to: customerEmail,
    subject: `Reserva cancelada — ${fechaTexto}`,
    html: buildEmail({
      title: 'Tu reserva ha sido cancelada',
      intro: `Hola <strong>${escapeHtml(customerName)}</strong>, lamentamos informarte de que tu reserva del <strong>${fechaTexto}</strong> ha sido cancelada.${pagadoOnline ? ' Te reembolsaremos el importe en el mismo método de pago con el que reservaste.' : ''}`,
      rows: [
        ['Servicio',  serviceName ?? 'Servicio'],
        ['Matrícula', licensePlate ?? '—'],
        ['Fecha',     fechaTexto],
      ],
      outro: `Si tienes cualquier duda o quieres reprogramar tu cita, escríbenos a <a href="mailto:${contacto}" style="color:#C9A84C;">${contacto}</a>${business?.phone ? ` o llámanos al ${escapeHtml(business.phone)}` : ''}. Disculpa las molestias.`,
      business,
    }),
  })
}
