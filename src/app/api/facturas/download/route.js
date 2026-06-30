import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { generateInvoicePDF } from '@/lib/pdf-invoice'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')   // 'servicio' | 'reserva'
  const id = searchParams.get('id')

  if (!tipo || !id) {
    return NextResponse.json({ error: 'Parámetros incorrectos.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Obtener customer y perfil del usuario autenticado.
  // El perfil nos dice si es admin (y de qué negocio); el customer, qué registros
  // le pertenecen como cliente. Los necesitamos para el check de propiedad de abajo.
  const [{ data: customer }, { data: profile }] = await Promise.all([
    supabase
      .from('customers')
      .select('id, full_name, email')
      .eq('auth_user_id', user.id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('role, business_id')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  // Obtener datos del servicio/reserva según tipo.
  // La RLS de service_records y bookings filtra por sesión: si el usuario no
  // tiene acceso (cliente ajeno, admin de otro negocio), devuelve null → 404.
  // Además, abajo verificamos la propiedad en código como red de seguridad
  // independiente de la RLS (defensa en profundidad — hallazgo M4 de la auditoría).
  let serviceName, totalAmount, itemDate, businessId
  let paymentMethod = null, bookingId = null, serviceRecordId = null
  let ownerCustomerId = null, ownerEmail = null

  if (tipo === 'servicio') {
    const { data: record } = await supabase
      .from('service_records')
      .select('id, business_id, customer_id, price, date, payment_method, services(name)')
      .eq('id', id)
      .maybeSingle()

    if (!record) return NextResponse.json({ error: 'Servicio no encontrado.' }, { status: 404 })
    serviceName = record.services?.name ?? 'Servicio'
    totalAmount = record.price
    itemDate = record.date
    serviceRecordId = record.id
    paymentMethod = record.payment_method
    businessId = record.business_id
    ownerCustomerId = record.customer_id

  } else if (tipo === 'reserva') {
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, business_id, customer_id, customer_email, price, date, services(name)')
      .eq('id', id)
      .maybeSingle()

    if (!booking) return NextResponse.json({ error: 'Reserva no encontrada.' }, { status: 404 })
    serviceName = booking.services?.name ?? 'Servicio'
    totalAmount = booking.price
    itemDate = booking.date
    bookingId = booking.id
    businessId = booking.business_id
    ownerCustomerId = booking.customer_id
    ownerEmail = booking.customer_email

  } else {
    return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 })
  }

  // ── Check de propiedad explícito (red de seguridad, independiente de la RLS) ──
  // Se permite la descarga si el usuario es:
  //  - admin del negocio dueño del registro, o
  //  - el cliente vinculado al registro (por customer_id o por email de la reserva).
  // Si la RLS regresara y dejara leer un registro ajeno, este check sigue cortando.
  const esAdminDelNegocio = profile?.role === 'admin' && profile.business_id === businessId
  const esClientePorId    = customer?.id && ownerCustomerId && customer.id === ownerCustomerId
  const esClientePorEmail = ownerEmail && user.email && ownerEmail === user.email
  if (!esAdminDelNegocio && !esClientePorId && !esClientePorEmail) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  // Buscar factura existente o crear una nueva
  const matchField = tipo === 'servicio' ? 'service_record_id' : 'booking_id'
  let { data: invoice } = await admin
    .from('invoices')
    .select('*')
    .eq(matchField, id)
    .maybeSingle()

  // Datos de la empresa del negocio al que pertenece este servicio/reserva
  const { data: business } = await admin
    .from('businesses')
    .select('id, name, nif, tagline, address, email')
    .eq('id', businessId)
    .single()

  if (!invoice) {

    // Generar número secuencial
    const { data: seqData } = await admin.rpc('nextval_invoice')
    const seq = seqData ?? Date.now()
    const year = new Date(itemDate).getFullYear()
    const invoiceNumber = `IMP-${year}-${String(seq).padStart(4, '0')}`

    const base = Number((totalAmount / 1.21).toFixed(2))
    const iva = Number((totalAmount - base).toFixed(2))

    const { data: newInvoice, error } = await admin
      .from('invoices')
      .insert({
        business_id: businessId,
        customer_id: customer?.id ?? null,
        service_record_id: serviceRecordId,
        booking_id: bookingId,
        invoice_number: invoiceNumber,
        invoice_date: itemDate,
        service_name: serviceName,
        total_amount: totalAmount,
        base_amount: base,
        iva_amount: iva,
        customer_name: customer?.full_name ?? user.email,
        customer_email: customer?.email ?? user.email,
      })
      .select()
      .single()

    if (error || !newInvoice) {
      Sentry.captureException(error ?? new Error('No invoice returned from insert'), {
        tags: { event: 'invoice_create_failed', source: 'facturas_download' },
        extra: { tipo, sourceId: id, businessId },
      })
      console.error({
        event: 'invoice_create_failed',
        source: 'facturas_download',
        tipo,
        sourceId: id,
        businessId,
        error: error?.message ?? 'No invoice returned',
      })
      return NextResponse.json({ error: 'Error al crear la factura.' }, { status: 500 })
    }

    invoice = newInvoice
  }

  // Generar PDF
  const pdfBytes = await generateInvoicePDF({ invoice, paymentMethod, business })

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura-${invoice.invoice_number}.pdf"`,
    },
  })
}
