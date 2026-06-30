'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { EliminarBtn } from '@/components/EliminarBtn'
import { eliminarCliente } from '../actions'

export function ClientesTable({ clientes, slug }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const filtered = query
    ? clientes.filter(c => {
        const q = query.toLowerCase()
        return (
          (c.full_name ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q) ||
          (c.phone ?? '').toLowerCase().includes(q)
        )
      })
    : clientes

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
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
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Reservas</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Registro</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/app/${slug}/admin/clientes/${c.id}`)}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.email || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.phone || '—'}</td>
                <td className="px-6 py-4 text-sm">
                  {c.bookings_count > 0
                    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{c.bookings_count} {c.bookings_count === 1 ? 'reserva' : 'reservas'}</span>
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/app/${slug}/admin/clientes/${c.id}/editar`}
                      className="text-blue-500 hover:text-blue-700 text-sm transition-colors"
                    >
                      Editar
                    </Link>
                    <EliminarBtn action={eliminarCliente.bind(null, c.id)} label="cliente" />
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
