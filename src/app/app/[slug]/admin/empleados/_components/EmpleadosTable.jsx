'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { toggleEmpleado, eliminarEmpleado } from '../actions'
import { EliminarBtn } from '@/components/EliminarBtn'

export default function EmpleadosTable({ empleados, enTurnoIds, conHorarioIds }) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const enTurnoSet    = new Set(enTurnoIds)
  const conHorarioSet = new Set(conHorarioIds)

  const filtered = query
    ? empleados.filter(e => {
        const q = query.toLowerCase()
        return (
          (e.full_name ?? '').toLowerCase().includes(q) ||
          (e.position ?? '').toLowerCase().includes(q) ||
          (e.email ?? '').toLowerCase().includes(q) ||
          (e.phone ?? '').toLowerCase().includes(q)
        )
      })
    : empleados

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, puesto, contacto..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {query && (
          <p className="text-xs text-gray-400 mt-2">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </p>
        )}
      </div>

      {query && filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <p className="text-sm">Sin resultados para &quot;{query}&quot;</p>
        </div>
      ) : (
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Puesto</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Contacto</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr
                key={e.id}
                onClick={() => router.push(`/admin/empleados/${e.id}/editar`)}
                className="border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{e.position || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {e.phone && <div>{e.phone}</div>}
                  {e.email && <div>{e.email}</div>}
                  {!e.phone && !e.email && '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      e.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {e.active ? 'Activo' : 'Inactivo'}
                    </span>
                    {enTurnoSet.has(e.id) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        En turno
                      </span>
                    )}
                    {e.active && !conHorarioSet.has(e.id) && (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                        Sin horario
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className="px-6 py-4 text-right"
                  onClick={ev => ev.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-3">
                    <form action={toggleEmpleado.bind(null, e.id, e.active)}>
                      <button
                        type="submit"
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          e.active
                            ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {e.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                    <EliminarBtn action={eliminarEmpleado.bind(null, e.id)} label="empleado" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
