'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { crearFacturaAutomatica } from '@/lib/invoices'
import { getAdminCtx } from '@/lib/admin-context'
import { requireFields } from '@/lib/validation'
import { empleadoDeVacaciones } from '@/lib/vacaciones'

async function facturarSiProcede({ supabase, businessId, serviceRecordId, service_id, customer_id, price, date, logCtx }) {
  const [{ data: serviceData }, { data: customerData }] = await Promise.all([
    supabase.from('services').select('name').eq('id', service_id).maybeSingle(),
    supabase.from('customers').select('full_name, email').eq('id', customer_id).maybeSingle(),
  ])
  try {
    await crearFacturaAutomatica({
      businessId,
      serviceRecordId,
      totalAmount:   price,
      itemDate:      date,
      serviceName:   serviceData?.name ?? 'Servicio',
      customerId:    customer_id,
      customerName:  customerData?.full_name ?? null,
      customerEmail: customerData?.email ?? null,
    })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { event: 'invoice_create_failed', source: `service_record_${logCtx}` },
      extra: { serviceRecordId, businessId },
    })
    console.error({
      event: 'invoice_create_failed',
      source: `service_record_${logCtx}`,
      serviceRecordId,
      businessId,
      error: err.message,
    })
  }
}

export async function crearRegistro(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const err = requireFields(formData, {
    customer_id: 'Selecciona un cliente',
    service_id:  'Selecciona un servicio',
    price:       'El precio es obligatorio',
    date:        'La fecha es obligatoria',
  })
  if (err) return { error: err }

  const customer_id = formData.get('customer_id')
  const service_id = formData.get('service_id')
  const price = formData.get('price')
  const date = formData.get('date')

  if (isNaN(price)) return { error: 'El precio no es válido' }

  const employee_id = formData.get('employee_id') || null

  if (await empleadoDeVacaciones(ctx.supabase, employee_id, date)) {
    return { error: 'Ese empleado está de vacaciones ese día. Asigna otro empleado o cambia la fecha.' }
  }

  const isPaid = formData.get('is_paid') === 'on'
  const paymentMethod = isPaid ? (formData.get('payment_method') || 'efectivo') : null

  const { data: newRecord, error } = await ctx.supabase
    .from('service_records')
    .insert({
      business_id: ctx.businessId,
      customer_id,
      service_id,
      employee_id,
      date,
      price: parseFloat(price),
      status: formData.get('status') || 'pendiente',
      notes: formData.get('notes')?.trim() || null,
      is_paid: isPaid,
      is_collected: formData.get('is_collected') === 'on',
      payment_method: paymentMethod,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  if (isPaid && paymentMethod && paymentMethod !== 'efectivo') {
    await facturarSiProcede({
      supabase:        ctx.supabase,
      businessId:      ctx.businessId,
      serviceRecordId: newRecord.id,
      service_id,
      customer_id,
      price:           parseFloat(price),
      date,
      logCtx:          'crear',
    })
  }

  revalidatePath(`/app/${ctx.slug}/admin/historial`)
  redirect(`/app/${ctx.slug}/admin/historial`)
}

export async function editarRegistro(id, prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const price = formData.get('price')
  if (!price || isNaN(price)) return { error: 'El precio es obligatorio' }

  const isPaid = formData.get('is_paid') === 'on'
  const paymentMethod = isPaid ? (formData.get('payment_method') || 'efectivo') : null
  const customer_id = formData.get('customer_id') || null
  const service_id = formData.get('service_id') || null
  const date = formData.get('date')
  const employee_id = formData.get('employee_id') || null

  if (await empleadoDeVacaciones(ctx.supabase, employee_id, date)) {
    return { error: 'Ese empleado está de vacaciones ese día. Asigna otro empleado o cambia la fecha.' }
  }

  const { error } = await ctx.supabase
    .from('service_records')
    .update({
      customer_id,
      service_id,
      employee_id,
      date,
      price: parseFloat(price),
      status: formData.get('status') || 'completado',
      notes: formData.get('notes')?.trim() || null,
      is_paid: isPaid,
      is_collected: formData.get('is_collected') === 'on',
      payment_method: paymentMethod,
    })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) return { error: error.message }

  if (isPaid && paymentMethod && paymentMethod !== 'efectivo') {
    await facturarSiProcede({
      supabase:        ctx.supabase,
      businessId:      ctx.businessId,
      serviceRecordId: id,
      service_id,
      customer_id,
      price:           parseFloat(price),
      date,
      logCtx:          'editar',
    })
  }

  revalidatePath(`/app/${ctx.slug}/admin/historial`)
  redirect(`/app/${ctx.slug}/admin/historial`)
}

export async function generarFacturaEfectivo(id) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const { data: record } = await ctx.supabase
    .from('service_records')
    .select('id, price, date, customer_id, customers(full_name, email), services(name)')
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .maybeSingle()

  if (!record) return { error: 'Registro no encontrado' }

  try {
    await crearFacturaAutomatica({
      businessId:      ctx.businessId,
      serviceRecordId: record.id,
      totalAmount:     record.price,
      itemDate:        record.date,
      serviceName:     record.services?.name ?? 'Servicio',
      customerId:      record.customer_id,
      customerName:    record.customers?.full_name ?? null,
      customerEmail:   record.customers?.email ?? null,
    })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { event: 'invoice_cash_failed', source: 'historial_generar_factura' },
      extra: { serviceRecordId: id, businessId: ctx.businessId },
    })
    console.error({
      event: 'invoice_cash_failed',
      source: 'historial_generar_factura',
      serviceRecordId: id,
      businessId: ctx.businessId,
      error: err.message,
    })
    return { error: 'No se pudo generar la factura' }
  }

  revalidatePath(`/app/${ctx.slug}/admin/historial`)
}

export async function eliminarRegistro(id) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  await ctx.supabase
    .from('service_records')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  revalidatePath(`/app/${ctx.slug}/admin/historial`)
}
