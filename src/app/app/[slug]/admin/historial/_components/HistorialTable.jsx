'use client'

import Link from 'next/link'
import { Euro, Car } from 'lucide-react'
import { SortableMonthlyTable } from '@/components/SortableMonthlyTable'
import { EliminarBtn } from '@/components/EliminarBtn'
import { eliminarRegistro } from '../actions'
import { GenerarFacturaBtn } from './GenerarFacturaBtn'

const ESTADO_STYLES = {
  completado: 'bg-green-50 text-green-700',
  pendiente:  'bg-yellow-50 text-yellow-700',
  cancelado:  'bg-red-50 text-red-500',
}

const COLUMNS = [
  { key: 'date',     label: 'Fecha',    getValue: r => r.date,                       sortable: true },
  { key: 'cliente',  label: 'Cliente',  getValue: r => r.customers?.full_name ?? '', sortable: true },
  { key: 'servicio', label: 'Servicio', getValue: r => r.services?.name ?? '',       sortable: true },
  { key: 'empleado', label: 'Empleado', getValue: r => r.employees?.full_name ?? '', sortable: true },
  { key: 'precio',   label: 'Precio',   getValue: r => r.price,                      sortable: true },
  { key: 'estado',   label: 'Estado',   getValue: r => r.status,                     sortable: true },
  { key: 'cobrado',  label: 'Cobrado',  getValue: r => r.is_paid ? 1 : 0,            sortable: true },
  { key: 'recogido', label: 'Recogido', getValue: r => r.is_collected ? 1 : 0,       sortable: true },
]

function RecordRow({ r }) {
  return (
    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      {[
        new Date(r.date).toLocaleDateString('es-ES'),
        r.customers?.full_name ?? '—',
        r.services?.name ?? '—',
        r.employees?.full_name ?? '—',
        `${r.price} €`,
      ].map((cell, i) => (
        <td key={i} className="px-6 py-4 text-sm text-gray-900">
          <Link href={`/admin/historial/${r.id}/editar`} className="block w-full">{cell}</Link>
        </td>
      ))}
      <td className="px-6 py-4">
        <Link href={`/admin/historial/${r.id}/editar`} className="block">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_STYLES[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {r.status}
          </span>
        </Link>
      </td>
      <td className="px-6 py-4">
        <Link href={`/admin/historial/${r.id}/editar`} className="flex items-center gap-1.5">
          <Euro size={16} className={r.is_paid ? 'text-green-500' : 'text-gray-300'} />
          {r.is_paid && r.payment_method && (
            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              {r.payment_method === 'efectivo' ? 'Ef.' :
               r.payment_method === 'transferencia' ? 'Tr.' :
               r.payment_method === 'bizum' ? 'Biz.' : 'Online'}
            </span>
          )}
        </Link>
      </td>
      <td className="px-6 py-4">
        <Link href={`/admin/historial/${r.id}/editar`} className="block">
          <Car size={16} className={r.is_collected ? 'text-green-500' : 'text-gray-300'} />
        </Link>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-4">
          {r.is_paid && r.payment_method === 'efectivo' && !r.invoices?.length && (
            <GenerarFacturaBtn id={r.id} />
          )}
          <Link href={`/admin/historial/${r.id}/editar`} className="text-blue-500 hover:text-blue-700 text-sm transition-colors">
            Editar
          </Link>
          <EliminarBtn action={eliminarRegistro.bind(null, r.id)} label="registro" />
        </div>
      </td>
    </tr>
  )
}

export function HistorialTable({ registros }) {
  return (
    <SortableMonthlyTable
      data={registros}
      columns={COLUMNS}
      search={{
        placeholder: 'Buscar por cliente, servicio, empleado...',
        fields: r => [r.customers?.full_name, r.services?.name, r.employees?.full_name, r.notes, r.date],
      }}
      monthly={{
        dateField: 'date',
        sortKey: 'date',
        label: { singular: 'servicio', plural: 'servicios' },
        monthBadge: r => r.status === 'pendiente',
        badgeLabel: { singular: 'pendiente', plural: 'pendientes' },
      }}
      renderRow={r => <RecordRow key={r.id} r={r} />}
      defaultSort={{ by: 'date', dir: 'asc' }}
      minWidth={750}
      hasActions
      emptyState={{ title: 'Sin registros todavía', message: 'Pulsa "Registrar servicio" para añadir el primero' }}
      persistKey="historial"
    />
  )
}
