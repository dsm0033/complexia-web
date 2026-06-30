'use client'

import { Download } from 'lucide-react'
import { SortableMonthlyTable } from '@/components/SortableMonthlyTable'
import { EnviarFacturaBtn } from './EnviarFacturaBtn'

const COLUMNS = [
  { key: 'numero',   label: 'Nº Factura', getValue: f => f.invoice_number, sortable: true },
  { key: 'fecha',    label: 'Fecha',      getValue: f => f.invoice_date,    sortable: true },
  { key: 'cliente',  label: 'Cliente',    getValue: f => f.customer_name ?? '', sortable: true },
  { key: 'servicio', label: 'Servicio',   getValue: f => f.service_name ?? '',  sortable: true },
  { label: 'Base' },
  { label: 'IVA 21%' },
  { key: 'total',    label: 'Total',      getValue: f => Number(f.total_amount), sortable: true },
]

function FacturaRow({ f }) {
  return (
    <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{f.invoice_number}</td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(f.invoice_date).toLocaleDateString('es-ES')}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{f.customer_name ?? '—'}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{f.service_name}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{Number(f.base_amount).toFixed(2)} €</td>
      <td className="px-6 py-4 text-sm text-gray-500">{Number(f.iva_amount).toFixed(2)} €</td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{Number(f.total_amount).toFixed(2)} €</td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-4">
          <EnviarFacturaBtn invoiceId={f.id} customerEmail={f.customer_email} emailSentAt={f.email_sent_at} />
          <a
            href={`/api/facturas/download?tipo=${f.service_record_id ? 'servicio' : 'reserva'}&id=${f.service_record_id ?? f.booking_id}`}
            className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 transition-colors"
            download
          >
            <Download size={14} />
            PDF
          </a>
        </div>
      </td>
    </tr>
  )
}

export function FacturasTable({ facturas }) {
  return (
    <SortableMonthlyTable
      data={facturas}
      columns={COLUMNS}
      search={{
        placeholder: 'Buscar por cliente, nº factura, servicio...',
        fields: f => [f.customer_name, f.service_name, f.invoice_number, f.customer_email],
      }}
      monthly={{
        dateField: 'invoice_date',
        sortKey: 'fecha',
        label: { singular: 'factura', plural: 'facturas' },
        yearTotal: f => Number(f.total_amount),
      }}
      renderRow={f => <FacturaRow key={f.id} f={f} />}
      defaultSort={{ by: 'fecha', dir: 'asc' }}
      minWidth={650}
      hasActions
      persistKey="facturas"
    />
  )
}
