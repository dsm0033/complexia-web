'use client'

import { Download } from 'lucide-react'
import { SortableMonthlyTable } from '@/components/SortableMonthlyTable'

const fmt    = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
const fmtPct = n => (Number(n) * 100).toFixed(2) + ' %'

const COLUMNS = [
  { key: 'empleado', label: 'Empleado',      getValue: r => r.full_name,             sortable: true },
  {                  label: 'Bruto',         headerAlign: 'right' },
  {                  label: 'SS trab.',      headerAlign: 'right' },
  { key: 'irpf',     label: 'IRPF',          getValue: r => r.calculo.deduccionIRPF, sortable: true, headerAlign: 'right' },
  {                  label: 'Neto',          headerAlign: 'right' },
  { key: 'empresa',  label: 'Coste empresa', getValue: r => r.calculo.costeEmpresa,  sortable: true, headerAlign: 'right' },
]

function NominaRow({ r, mes }) {
  const { id, full_name, contrato, calculo } = r
  return (
    <tr key={id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
      <td className="px-6 py-4">
        <a href={`/admin/empleados/${id}/contrato`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
          {full_name}
        </a>
        <div className="flex items-center gap-2 mt-0.5">
          {contrato.category && <span className="text-xs text-gray-400">{contrato.category}</span>}
          {calculo.esPagaExtra && (
            <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
              + paga extra
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right text-gray-900 font-medium">{fmt(calculo.brutoMensual)}</td>
      <td className="px-6 py-4 text-right text-gray-600">{fmt(calculo.deduccionSS)}</td>
      <td className="px-6 py-4 text-right">
        <span className="text-gray-600">{fmt(calculo.deduccionIRPF)}</span>
        <span className="text-xs text-gray-400 ml-1">({fmtPct(calculo.irpfRate)})</span>
      </td>
      <td className="px-6 py-4 text-right font-semibold text-gray-900">{fmt(calculo.neto)}</td>
      <td className="px-6 py-4 text-right text-blue-700 font-medium">{fmt(calculo.costeEmpresa)}</td>
      <td className="px-6 py-4">
        <a
          href={`/api/nominas/download?employee_id=${id}&mes=${mes}`}
          title="Descargar nómina PDF"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Download size={14} />
          PDF
        </a>
      </td>
    </tr>
  )
}

export function NominasTable({ empleados, mes }) {
  return (
    <SortableMonthlyTable
      data={empleados}
      columns={COLUMNS}
      search={{
        placeholder: 'Buscar por empleado...',
        fields: r => [r.full_name],
      }}
      renderRow={r => <NominaRow key={r.id} r={r} mes={mes} />}
      defaultSort={{ by: 'empleado', dir: 'asc' }}
      minWidth={650}
      hasActions
    />
  )
}
