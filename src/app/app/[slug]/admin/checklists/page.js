import Link from 'next/link'
import { getAdminPageCtx } from '@/lib/admin-context'
import { toggleChecklist, eliminarChecklist } from './actions'
import { EliminarBtn } from '@/components/EliminarBtn'

export const metadata = { title: 'Checklists · Admin IMPECABLE' }

export default async function ChecklistsPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: checklists } = await supabase
    .from('checklists')
    .select('id, name, items, active, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checklists</h1>
          <p className="text-gray-500 mt-1">{checklists?.length ?? 0} checklists creados</p>
        </div>
        <Link
          href="/admin/checklists/nuevo"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo checklist
        </Link>
      </div>

      <div className="space-y-4">
        {!checklists?.length ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-lg font-medium">Sin checklists todavía</p>
            <p className="text-sm mt-1">Pulsa "Nuevo checklist" para crear el primero</p>
          </div>
        ) : (
          checklists.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-sm font-semibold text-gray-900">{c.name}</h2>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{c.items?.length ?? 0} ítems</p>
                  <ul className="space-y-1">
                    {c.items?.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        {item.text}
                      </li>
                    ))}
                    {c.items?.length > 5 && (
                      <li className="text-xs text-gray-400 pl-3.5">
                        +{c.items.length - 5} más...
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <form action={toggleChecklist.bind(null, c.id, c.active)}>
                    <button
                      type="submit"
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                        c.active
                          ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {c.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </form>
                  <Link
                    href={`/admin/checklists/${c.id}/editar`}
                    className="text-blue-500 hover:text-blue-700 text-sm transition-colors"
                  >
                    Editar
                  </Link>
                  <EliminarBtn action={eliminarChecklist.bind(null, c.id)} label="checklist" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
