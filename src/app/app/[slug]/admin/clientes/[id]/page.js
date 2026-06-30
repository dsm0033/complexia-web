import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminPageCtx } from '@/lib/admin-context'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { supabase, businessId } = await getAdminPageCtx()
  const { data: cliente } = await supabase
    .from('customers')
    .select('full_name')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()
  return { title: `${cliente?.full_name ?? 'Cliente'} · Admin IMPECABLE` }
}

const STATUS_LABELS = {
  pendiente:  { label: 'Pendiente',  cls: 'bg-yellow-50 text-yellow-700' },
  confirmado: { label: 'Confirmado', cls: 'bg-blue-50 text-blue-700' },
  pagado:     { label: 'Pagado',     cls: 'bg-green-50 text-green-700' },
  cancelado:  { label: 'Cancelado',  cls: 'bg-red-50 text-red-700' },
}

export default async function ClienteDetallePage({ params }) {
  const { slug, id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: cliente } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, created_at')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (!cliente) notFound()

  const { data: reservas } = await supabase
    .from('bookings')
    .select('id, date, time_slot, status, price, license_plate, services(name)')
    .eq('customer_id', id)
    .eq('business_id', businessId)
    .order('date', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link href={`/app/${slug}/admin/clientes`} className="text-sm text-gray-400 hover:text-gray-600 mb-2 inline-block">
            ← Clientes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{cliente.full_name}</h1>
          <p className="text-gray-500 mt-1">
            Cliente desde {new Date(cliente.created_at).toLocaleDateString('es-ES')}
          </p>
        </div>
        <Link
          href={`/app/${slug}/admin/clientes/${id}/editar`}
          className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Datos de contacto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Datos de contacto</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-gray-400 mb-1">Email</dt>
            <dd className="text-sm text-gray-900">{cliente.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 mb-1">Teléfono</dt>
            <dd className="text-sm text-gray-900">{cliente.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 mb-1">Total reservas</dt>
            <dd className="text-sm font-semibold text-gray-900">{reservas?.length ?? 0}</dd>
          </div>
        </dl>
      </div>

      {/* Reservas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Reservas</h2>
        </div>

        {!reservas?.length ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">Este cliente aún no tiene reservas vinculadas.</p>
            <p className="text-xs mt-1 text-gray-300">Las reservas nuevas se asocian automáticamente por email o teléfono.</p>
          </div>
        ) : (
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Servicio</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Matrícula</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Importe</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => {
                const st = STATUS_LABELS[r.status] ?? { label: r.status, cls: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(r.date).toLocaleDateString('es-ES')}
                      <span className="ml-2 text-gray-400">{String(r.time_slot).slice(0, 5)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.services?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{r.license_plate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.price} €</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
