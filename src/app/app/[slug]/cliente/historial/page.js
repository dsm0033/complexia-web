import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, ArrowLeft, Download } from 'lucide-react'

export const metadata = { title: 'Mi historial · IMPECABLE' }

export default async function ClienteHistorialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const [{ data: servicios }, { data: reservas }] = await Promise.all([
    customer?.id
      ? supabase
          .from('service_records')
          .select('id, date, price, status, notes, services(name), employees(full_name)')
          .eq('customer_id', customer.id)
          .order('date', { ascending: false })
      : { data: [] },
    supabase
      .from('bookings')
      .select('id, date, time_slot, price, status, services(name)')
      .eq('customer_email', user.email)
      .in('status', ['pagado', 'confirmado'])
      .order('date', { ascending: false }),
  ])

  const historial = [
    ...(servicios ?? []).map(s => ({
      id: s.id,
      tipo: 'servicio',
      nombre: s.services?.name ?? 'Servicio',
      fecha: s.date,
      precio: s.price,
      estado: s.status,
      tecnico: s.employees?.full_name ?? null,
      notas: s.notes ?? null,
      hora: null,
      factura: s.status === 'completado',
    })),
    ...(reservas ?? []).map(r => ({
      id: r.id,
      tipo: 'reserva',
      nombre: r.services?.name ?? 'Servicio',
      fecha: r.date,
      precio: r.price,
      estado: r.status === 'pagado' ? 'pagada' : 'confirmada',
      tecnico: null,
      notas: null,
      hora: r.time_slot?.slice(0, 5) ?? null,
      factura: true,
    })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  return (
    <div className="space-y-6">
      <div>
        <Link href="/cliente" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3">
          <ArrowLeft size={15} /> Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Mi historial</h1>
        <p className="text-gray-500 text-sm mt-1">Todos tus servicios y reservas en IMPECABLE</p>
      </div>

      {historial.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
          <ClipboardList size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Todavía no tienes servicios registrados.</p>
        </div>
      )}

      {historial.length > 0 && (
        <div className="space-y-3">
          {historial.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 px-4 py-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.nombre}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {item.hora && <span> · {item.hora}h</span>}
                  </p>
                  {item.tecnico && (
                    <p className="text-xs text-gray-400 mt-0.5">Técnico: {item.tecnico}</p>
                  )}
                  {item.notas && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{item.notas}"</p>
                  )}
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <p className="font-semibold text-gray-800">{Number(item.precio).toFixed(2)} €</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.estado === 'completado'  ? 'bg-green-100 text-green-700'
                    : item.estado === 'pagada'    ? 'bg-blue-100 text-blue-700'
                    : item.estado === 'confirmada' ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-600'
                  }`}>
                    {item.estado === 'completado' ? 'Completado'
                      : item.estado === 'pagada'  ? 'Pagada'
                      : item.estado === 'confirmada' ? 'Confirmada'
                      : 'Pendiente'}
                  </span>
                  {item.factura && (
                    <a
                      href={`/api/facturas/download?tipo=${item.tipo}&id=${item.id}`}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-2 py-1 transition-colors"
                      download
                    >
                      <Download size={12} />
                      Factura PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
