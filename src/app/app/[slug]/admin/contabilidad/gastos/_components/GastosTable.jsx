'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { SortableMonthlyTable } from '@/components/SortableMonthlyTable'
import { eliminarGasto } from '../actions'

const CATEGORIA_LABELS = {
  suministros:       'Suministros',
  alquiler:          'Alquiler',
  nominas:           'Nóminas',
  material:          'Material',
  publicidad:        'Publicidad',
  mantenimiento_web: 'Mantenimiento web',
  ia:                'IA',
  otros:             'Otros',
}

const CATEGORIA_COLORS = {
  suministros:       'bg-blue-100 text-blue-700',
  alquiler:          'bg-purple-100 text-purple-700',
  nominas:           'bg-orange-100 text-orange-700',
  material:          'bg-teal-100 text-teal-700',
  publicidad:        'bg-pink-100 text-pink-700',
  mantenimiento_web: 'bg-cyan-100 text-cyan-700',
  ia:                'bg-indigo-100 text-indigo-700',
  otros:             'bg-gray-100 text-gray-600',
}

const METODO_LABELS = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  bizum:         'Bizum',
  tarjeta:       'Tarjeta',
}

const COLUMNS = [
  { key: 'fecha',       label: 'Fecha',       getValue: g => g.date,               sortable: true },
  { key: 'descripcion', label: 'Descripción', getValue: g => g.description ?? '',  sortable: true },
  {                     label: 'Proveedor' },
  {                     label: 'Categoría' },
  {                     label: 'Base' },
  {                     label: 'IVA' },
  { key: 'importe',     label: 'Total',       getValue: g => Number(g.amount),     sortable: true },
  {                     label: 'Pago' },
]

function GastoRow({ g, onDeleted, slug }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm(`¿Eliminar "${g.description}"?`)) return
    startTransition(async () => {
      const res = await eliminarGasto(g.id)
      if (res?.error) alert(res.error)
      else { onDeleted(); router.refresh() }
    })
  }

  const base = g.iva_rate > 0 ? Number(g.amount) / (1 + g.iva_rate / 100) : Number(g.amount)
  const iva  = Number(g.amount) - base

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(g.date).toLocaleDateString('es-ES')}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{g.description}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{g.provider ?? '—'}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORIA_COLORS[g.category]}`}>
          {CATEGORIA_LABELS[g.category]}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{base.toFixed(2)} €</td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {g.iva_rate > 0 ? `${iva.toFixed(2)} € (${g.iva_rate}%)` : '—'}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{Number(g.amount).toFixed(2)} €</td>
      <td className="px-6 py-4 text-sm text-gray-400">{METODO_LABELS[g.payment_method]}</td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-3">
          <a
            href={`/app/${slug}/admin/contabilidad/gastos/${g.id}/editar`}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </a>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function GastosTable({ gastos: initialGastos, slug }) {
  const [gastos, setGastos] = useState(initialGastos)

  return (
    <SortableMonthlyTable
      data={gastos}
      columns={COLUMNS}
      search={{
        placeholder: 'Buscar por descripción, proveedor, categoría...',
        fields: g => [g.description, g.provider, CATEGORIA_LABELS[g.category]],
      }}
      monthly={{
        dateField: 'date',
        sortKey: 'fecha',
        label: { singular: 'gasto', plural: 'gastos' },
        yearTotal: g => Number(g.amount),
        reverse: true,
      }}
      renderRow={g => (
        <GastoRow
          key={g.id}
          g={g}
          onDeleted={() => setGastos(prev => prev.filter(x => x.id !== g.id))}
          slug={slug}
        />
      )}
      defaultSort={{ by: 'fecha', dir: 'desc' }}
      minWidth={800}
      hasActions
      persistKey="gastos"
    />
  )
}
