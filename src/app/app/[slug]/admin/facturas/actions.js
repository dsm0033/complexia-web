'use server'

import { getAdminCtx } from '@/lib/admin-context'
import { generateInvoicePDF } from '@/lib/pdf-invoice'
import { buildEmail } from '@/lib/email'
import { resend, emailFrom, DEFAULT_FROM_EMAIL } from '@/lib/resend'

// NOTA: a propósito NO existe una acción para eliminar facturas. Una factura
// emitida no puede borrarse (rompería la serie correlativa y la normativa
// fiscal española); para anular una factura real se emite una rectificativa.
// El borrado está además bloqueado a nivel de BD (RLS sin política DELETE).

export async function enviarFacturaPorEmail(invoiceId) {
  if (!resend) return { error: 'Email no configurado.' }

  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }
  const { supabase, businessId } = ctx

  // La RLS de invoices filtra por business_id del admin; .eq adicional como red de seguridad
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('business_id', businessId)
    .single()

  if (!invoice) return { error: 'Factura no encontrada.' }
  if (!invoice.customer_email) return { error: 'Esta factura no tiene email de cliente.' }

  // Obtener payment_method si hay service_record vinculado
  let paymentMethod = null
  if (invoice.service_record_id) {
    const { data: sr } = await supabase
      .from('service_records')
      .select('payment_method')
      .eq('id', invoice.service_record_id)
      .maybeSingle()
    paymentMethod = sr?.payment_method ?? null
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('name, nif, tagline, address, email')
    .eq('id', businessId)
    .single()

  const pdfBytes = await generateInvoicePDF({ invoice, paymentMethod, business })

  const from = emailFrom(business)

  const { error } = await resend.emails.send({
    from,
    to: invoice.customer_email,
    subject: `Factura ${invoice.invoice_number} — ${business?.name ?? 'Impecable'}`,
    html: buildEmail({
      title: `Factura ${invoice.invoice_number}`,
      intro: `Hola <strong>${invoice.customer_name}</strong>, te adjuntamos la factura correspondiente al servicio realizado.`,
      rows: [
        ['Nº Factura', invoice.invoice_number],
        ['Fecha',      new Date(invoice.invoice_date).toLocaleDateString('es-ES')],
        ['Servicio',   invoice.service_name],
        ['Total',      `${Number(invoice.total_amount).toFixed(2)} €`],
      ],
      outro: `¿Alguna duda? Escríbenos a <a href="mailto:${business?.email ?? DEFAULT_FROM_EMAIL}" style="color:#C9A84C;">${business?.email ?? DEFAULT_FROM_EMAIL}</a>`,
      business,
    }),
    attachments: [{
      filename: `factura-${invoice.invoice_number}.pdf`,
      content:  Buffer.from(pdfBytes),
    }],
  })

  if (error) return { error: 'No se pudo enviar el email.' }

  await supabase
    .from('invoices')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', invoiceId)

  return { ok: true }
}
