import { Suspense } from 'react'
import { getAdminPageCtx } from '@/lib/admin-context'
import { esReservaAbandonada } from '@/lib/bookings'
import { ReservasTable } from './_components/ReservasTable'

export const metadata = { title: 'Reservas · Admin IMPECABLE' }

export default async function ReservasPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: todasReservas } = await supabase
    .from('bookings')
    .select('id, date, time_slot, customer_name, license_plate, customer_email, price, status, created_at, services(name)')
    .eq('business_id', businessId)
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true })

  // Separar reservas reales de las abandonadas (carritos de pago no completados).
  // Mismo criterio que disponibilidad y bloqueo de días — ver @/lib/bookings.
  const abandonadas = todasReservas?.filter(r => esReservaAbandonada(r)) ?? []
  const reservas    = todasReservas?.filter(r => !esReservaAbandonada(r)) ?? []

  const pagadas    = reservas.filter(r => r.status === 'pagado').length
  const confirmadas = reservas.filter(r => r.status === 'confirmado').length
  const pendientes = reservas.filter(r => r.status === 'pendiente').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pagadas} pagadas online · {confirmadas} pago en local · {pendientes} pendientes
          {abandonadas.length > 0 && ` · ${abandonadas.length} abandonadas`}
        </p>
      </div>

      {!reservas?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No hay reservas todavía.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando...</div>}>
              <ReservasTable reservas={reservas} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
