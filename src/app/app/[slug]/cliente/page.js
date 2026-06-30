import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ClipboardList, ChevronRight, User } from 'lucide-react'

export const metadata = { title: 'Mi portal · IMPECABLE' }

export default async function ClientePage({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, full_name, phone')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const [{ data: servicios }, { data: reservas }] = await Promise.all([
    customer?.id
      ? supabase
          .from('service_records')
          .select('id, date, price, status, services(name)')
          .eq('customer_id', customer.id)
          .order('date', { ascending: false })
          .limit(3)
      : { data: [] },
    supabase
      .from('bookings')
      .select('id, date, time_slot, status, services(name)')
      .eq('customer_email', user.email)
      .eq('status', 'pagado')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(3),
  ])

  const proximaReserva = reservas?.[0]

  return (
    <div className="space-y-6">

      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido{customer?.full_name ? `, ${customer.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Tu portal personal de IMPECABLE</p>
      </div>

      {/* Sin cuenta vinculada */}
      {!customer && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Tu cuenta no está vinculada a ningún cliente aún. Si has realizado reservas, escríbenos a{' '}
          <a href="mailto:info@laimpecable.es" className="font-medium underline">info@laimpecable.es</a>
          {' '}y lo gestionamos.
        </div>
      )}

      {/* Próxima reserva */}
      {proximaReserva && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Próxima cita</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="font-semibold text-gray-900">{proximaReserva.services?.name ?? 'Servicio'}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>
                {new Date(proximaReserva.date).toLocaleDateString('es-ES', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </span>
              <span>{proximaReserva.time_slot?.slice(0, 5)}h</span>
            </div>
            <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
              proximaReserva.status === 'confirmada'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {proximaReserva.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
            </span>
          </div>
        </section>
      )}

      {/* Últimos servicios */}
      {servicios && servicios.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Últimos servicios</h2>
            <Link href={`/app/${slug}/cliente/historial`} className="text-xs text-dorado hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-2">
            {servicios.map((s) => (
              <Link key={s.id} href={`/app/${slug}/cliente/historial`} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm hover:border-dorado transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.services?.name ?? 'Servicio'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{Number(s.price).toFixed(2)} €</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Accesos rápidos */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          href={`/app/${slug}/cliente/historial`}
          className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 hover:border-dorado transition-colors shadow-sm"
        >
          <ClipboardList size={20} className="text-dorado" />
          <p className="text-sm font-semibold text-gray-800">Mi historial</p>
          <p className="text-xs text-gray-400">Todos tus servicios</p>
        </Link>
        <Link
          href={`/app/${slug}/cliente/perfil`}
          className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 hover:border-dorado transition-colors shadow-sm"
        >
          <User size={20} className="text-dorado" />
          <p className="text-sm font-semibold text-gray-800">Mi perfil</p>
          <p className="text-xs text-gray-400">Tus datos personales</p>
        </Link>
      </section>

      {/* CTA reservar */}
      <div className="bg-fondo rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-white">¿Necesitas otra cita?</p>
          <p className="text-xs text-gray-400 mt-0.5">Reserva tu próximo servicio online</p>
        </div>
        <Link
          href={`/app/${slug}/reservar`}
          className="bg-dorado text-fondo text-sm font-semibold px-4 py-2 rounded-lg hover:bg-dorado-dim transition-colors shrink-0"
        >
          Reservar
        </Link>
      </div>

    </div>
  )
}
