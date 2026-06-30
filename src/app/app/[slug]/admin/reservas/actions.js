'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { getAdminCtx } from '@/lib/admin-context'
import { enviarEmailCancelacion } from '@/lib/booking-emails'

// Cancela una reserva (status -> 'cancelado'). No la borra: conserva el registro
// y libera el hueco, ya que disponibilidad y bloqueo de días excluyen las
// canceladas (ver @/lib/bookings y la RPC crear_booking_atomico).
// notify: si es true y la reserva tiene email, avisa al cliente por correo.
export async function cancelarReserva(id, notify = false) {
  if (!id) return { error: 'ID no especificado.' }

  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }

  // Estado de pago ANTES de cancelar: el update lo dejaría en 'cancelado'.
  // status 'pagado' solo lo pone el webhook de Stripe → identifica el pago online.
  const { data: prev } = await ctx.supabase
    .from('bookings')
    .select('status')
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .single()
  const pagadoOnline = prev?.status === 'pagado'

  const { data: reserva, error } = await ctx.supabase
    .from('bookings')
    .update({ status: 'cancelado' })
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .select('customer_name, customer_email, license_plate, date, time_slot, services(name)')
    .single()

  if (error) return { error: 'No se pudo cancelar la reserva.' }

  // El registro de historial nacido de esta reserva (booking_id) debe reflejar
  // la cancelación; si no, se queda 'pendiente'. Integridad de datos → siempre,
  // haya email o no. No tocamos is_paid ni la factura (el ingreso del P&L sale
  // de invoices; reembolso/rectificativa son procesos aparte). Best-effort: si
  // falla no revertimos la cancelación, solo lo registramos.
  const { error: srError } = await ctx.supabase
    .from('service_records')
    .update({ status: 'cancelado' })
    .eq('booking_id', id)
    .eq('business_id', ctx.businessId)

  if (srError) {
    Sentry.captureException(srError, {
      tags: { event: 'cancel_service_record_failed', source: 'admin_reservas' },
      extra: { bookingId: id, businessId: ctx.businessId },
    })
    console.error({
      event: 'cancel_service_record_failed',
      source: 'admin_reservas',
      bookingId: id,
      error: srError.message,
    })
  }

  if (notify && reserva?.customer_email) {
    try {
      await enviarEmailCancelacion({
        db:            ctx.supabase,
        businessId:    ctx.businessId,
        customerName:  reserva.customer_name,
        customerEmail: reserva.customer_email,
        licensePlate:  reserva.license_plate,
        date:          reserva.date,
        hora:          String(reserva.time_slot).slice(0, 5),
        serviceName:   reserva.services?.name,
        pagadoOnline,
      })
    } catch (err) {
      // No revertimos la cancelación si el email falla; solo lo registramos.
      Sentry.captureException(err, {
        tags: { event: 'cancel_email_failed', source: 'admin_reservas' },
        extra: { bookingId: id, businessId: ctx.businessId },
      })
      console.error({
        event: 'cancel_email_failed',
        source: 'admin_reservas',
        bookingId: id,
        error: err.message,
      })
      revalidatePath(`/app/${ctx.slug}/admin/reservas`)
      revalidatePath(`/app/${ctx.slug}/admin/historial`)
      return { ok: true, emailError: true }
    }
  }

  revalidatePath(`/app/${ctx.slug}/admin/reservas`)
  revalidatePath(`/app/${ctx.slug}/admin/historial`)
  return { ok: true }
}

// Elimina una reserva DEFINITIVAMENTE (para limpiar reservas de prueba/basura).
// Borra primero el registro de historial nacido de esta reserva (booking_id) y
// luego la reserva: así no importa la regla ON DELETE de service_records.booking_id.
// NO toca facturas: invoices.booking_id / .service_record_id son ON DELETE SET NULL,
// así que una factura asociada se conserva (desvinculada) — borrar facturas sería
// incorrecto legalmente. Los registros de historial creados a mano (sin booking_id)
// no se ven afectados.
export async function eliminarReserva(id) {
  if (!id) return { error: 'ID no especificado.' }

  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }

  const { error: srError } = await ctx.supabase
    .from('service_records')
    .delete()
    .eq('booking_id', id)
    .eq('business_id', ctx.businessId)

  if (srError) return { error: 'No se pudo eliminar el registro de historial asociado.' }

  const { error } = await ctx.supabase
    .from('bookings')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) return { error: 'No se pudo eliminar la reserva.' }

  revalidatePath(`/app/${ctx.slug}/admin/reservas`)
  revalidatePath(`/app/${ctx.slug}/admin/historial`)
  return { ok: true }
}
