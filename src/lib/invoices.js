import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Crea una factura automáticamente si no existe ya para el registro dado.
 * Idempotente: si la factura ya existe, la devuelve sin crear otra.
 * Solo llamar cuando el método de pago NO es efectivo.
 */
export async function crearFacturaAutomatica({
  businessId,
  serviceRecordId = null,
  bookingId = null,
  totalAmount,
  itemDate,
  serviceName,
  customerId = null,
  customerName = null,
  customerEmail = null,
}) {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Gate fiscal: una factura española válida exige NIF y domicilio del emisor.
  // Si el negocio aún no los tiene, NO emitimos factura (evita facturas inválidas
  // y huecos en la serie correlativa). Se desbloquea solo en cuanto se rellenen
  // en admin → Configuración → Empresa. El pago/servicio se procesa igual.
  const { data: business } = await admin
    .from('businesses')
    .select('nif, address')
    .eq('id', businessId)
    .maybeSingle()

  if (!business?.nif || !business?.address) {
    console.warn({
      event: 'invoice_skipped_missing_fiscal_data',
      source: 'crearFacturaAutomatica',
      businessId,
      hasNif: !!business?.nif,
      hasAddress: !!business?.address,
    })
    return null
  }

  const matchField = serviceRecordId ? 'service_record_id' : 'booking_id'
  const matchId = serviceRecordId ?? bookingId

  const { data: existing } = await admin
    .from('invoices')
    .select('id')
    .eq(matchField, matchId)
    .maybeSingle()

  if (existing) return existing

  const { data: seqData } = await admin.rpc('nextval_invoice')
  const seq = seqData ?? Date.now()
  const year = new Date(itemDate).getFullYear()
  const invoiceNumber = `IMP-${year}-${String(seq).padStart(4, '0')}`

  const base = Number((totalAmount / 1.21).toFixed(2))
  const iva = Number((totalAmount - base).toFixed(2))

  const { data: invoice, error } = await admin
    .from('invoices')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      service_record_id: serviceRecordId,
      booking_id: bookingId,
      invoice_number: invoiceNumber,
      invoice_date: itemDate,
      service_name: serviceName,
      total_amount: totalAmount,
      base_amount: base,
      iva_amount: iva,
      customer_name: customerName,
      customer_email: customerEmail,
    })
    .select()
    .single()

  if (error) throw error
  return invoice
}
