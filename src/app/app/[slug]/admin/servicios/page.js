import Link from 'next/link'
import { getAdminPageCtx } from '@/lib/admin-context'
import { toggleServicio, moverServicio, eliminarServicio } from '@/app/actions/services'
import { EliminarBtn } from '@/components/EliminarBtn'

export const metadata = { title: 'Servicios · Admin IMPECABLE' }

export default async function ServiciosPage() {
  const { supabase, businessId, slug } = await getAdminPageCtx()

  const { data: servicios } = await supabase
    .from('services')
    .select('id, name, description, price, duration_minutes, active, highlight, sort_order')
    .eq('business_id', businessId)
    .order('sort_order')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-500 mt-1">{servicios?.length ?? 0} servicios configurados</p>
        </div>
        <Link
          href={`/app/${slug}/admin/servicios/nuevo`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo servicio
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {!servicios?.length ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg font-medium">Sin servicios todavía</p>
            <p className="text-sm mt-1">Pulsa "Nuevo servicio" para añadir el primero</p>
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Servicio</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Precio</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Duración</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      {s.highlight && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                          Destacado
                        </span>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{s.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{s.price ? `${s.price} €` : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.duration_minutes ? `${s.duration_minutes} min` : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      s.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <div className="flex flex-col gap-0.5">
                        <form action={moverServicio.bind(null, s.id, 'up')}>
                          <button type="submit" className="text-gray-400 hover:text-gray-600 leading-none px-1" title="Subir">▲</button>
                        </form>
                        <form action={moverServicio.bind(null, s.id, 'down')}>
                          <button type="submit" className="text-gray-400 hover:text-gray-600 leading-none px-1" title="Bajar">▼</button>
                        </form>
                      </div>
                      <form action={toggleServicio.bind(null, s.id, s.active)}>
                        <button
                          type="submit"
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                            s.active
                              ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {s.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                      <Link
                        href={`/app/${slug}/admin/servicios/${s.id}/editar`}
                        className="text-blue-500 hover:text-blue-700 text-sm transition-colors"
                      >
                        Editar
                      </Link>
                      <EliminarBtn action={eliminarServicio.bind(null, s.id)} label="servicio" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
