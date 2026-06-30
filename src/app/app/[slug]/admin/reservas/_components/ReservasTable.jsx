'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { SortableMonthlyTable } from '@/components/SortableMonthlyTable'
import { cancelarReserva, eliminarReserva } from '../actions'

const STATUS_STYLES = {
  pagado:     'bg-green-100 text-green-800',
  confirmado: 'bg-blue-100 text-blue-800',
  pendiente:  'bg-yellow-100 text-yellow-800',
  cancelado:  'bg-red-100 text-red-800',
}

function CancelarBtn({ id, customerEmail }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('¿Cancelar esta reserva? El hueco quedará libre para otros clientes.')) return
    // Solo preguntamos por el aviso si hay un email al que enviarlo.
    const notify = customerEmail
      ? confirm(`¿Avisar al cliente por email (${customerEmail}) de la cancelación?`)
      : false
    startTransition(async () => {
      const res = await cancelarReserva(id, notify)
      if (res?.error) alert(res.error)
      else if (res?.emailError) alert('Reserva cancelada, pero no se pudo enviar el email al cliente.')
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-red-500 hover:text-red-700 text-sm disabled:opacity-40 transition-colors"
    >
      {pending ? '…' : 'Cancelar'}
    </button>
  )
}

function EliminarBtn({ id, customerName, date }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(
      `⚠️ ELIMINAR DEFINITIVAMENTE la reserva de ${customerName || 'este cliente'} (${date}).\n\n` +
      'Se borrará también su registro del historial. Esta acción NO se puede deshacer.\n\n' +
      '¿Continuar?'
    )) return
    startTransition(async () => {
      const res = await eliminarReserva(id)
      if (res?.error) alert(res.error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-gray-400 hover:text-red-700 text-sm disabled:opacity-40 transition-colors"
    >
      {pending ? '…' : 'Eliminar'}
    </button>
  )
}

const COLUMNS = [
  { key: 'fecha',    label: 'Fecha',     getValue: r => r.date + (r.time_slot ?? ''), sortable: true },
  {                  label: 'Hora' },
  { key: 'cliente',  label: 'Cliente',   getValue: r => r.customer_name ?? '',        sortable: true },
  {                  label: 'Matrícula' },
  { key: 'servicio', label: 'Servicio',  getValue: r => r.services?.name ?? '',       sortable: true },
  { key: 'precio',   label: 'Precio',    getValue: r => r.price,                      sortable: true },
  { key: 'estado',   label: 'Estado',    getValue: r => r.status,                     sortable: true },
]

function ReservaRow({ r }) {
  return (
    <tr key={r.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
        {new Date(r.date + 'T00:00:00').toLocaleDateString('es-ES', {
          weekday: 'short', day: 'numeric', month: 'short'
        })}
      </td>
      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.time_slot?.slice(0, 5)}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900">{r.customer_name}</p>
        {r.customer_email && <p className="text-xs text-gray-400">{r.customer_email}</p>}
      </td>
      <td className="px-4 py-3 font-mono text-gray-700 uppercase">{r.license_plate}</td>
      <td className="px-4 py-3 text-gray-600">{r.services?.name ?? '—'}</td>
      <td className="px-4 py-3 text-right font-semibold text-gray-900">{r.price}€</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {r.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          {r.status === 'cancelado'
            ? <EliminarBtn id={r.id} customerName={r.customer_name} date={r.date} />
            : <CancelarBtn id={r.id} customerEmail={r.customer_email} />}
        </div>
      </td>
    </tr>
  )
}

export function ReservasTable({ reservas }) {
  const [showCancelled, setShowCancelled] = useState(false)

  const numCanceladas = reservas.filter(r => r.status === 'cancelado').length
  const visibles = showCancelled ? reservas : reservas.filter(r => r.status !== 'cancelado')

  return (
    <>
      {numCanceladas > 0 && (
        <div className="flex justify-end px-4 pt-4 pb-2">
          <button
            onClick={() => setShowCancelled(v => !v)}
            aria-pressed={showCancelled}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium shadow-sm transition-colors ${
              showCancelled
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {showCancelled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCancelled ? 'Ocultar canceladas' : 'Ver canceladas'}
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-700">
              {numCanceladas}
            </span>
          </button>
        </div>
      )}
      <SortableMonthlyTable
      data={visibles}
      columns={COLUMNS}
      search={{
        placeholder: 'Buscar por cliente, matrícula, servicio...',
        fields: r => [r.customer_name, r.customer_email, r.license_plate, r.services?.name, r.date],
      }}
      monthly={{
        dateField: 'date',
        sortKey: 'fecha',
        label: { singular: 'reserva', plural: 'reservas' },
      }}
      renderRow={r => <ReservaRow key={r.id} r={r} />}
      defaultSort={{ by: 'fecha', dir: 'asc' }}
      minWidth={700}
      hasActions
      persistKey="reservas"
      />
    </>
  )
}
