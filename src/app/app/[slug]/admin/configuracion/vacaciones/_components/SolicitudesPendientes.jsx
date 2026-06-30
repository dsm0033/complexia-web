'use client'

import { useActionState } from 'react'

const fmt = d => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

function RequestRow({ req, aprobarAction, rechazarAction }) {
  const [approveState, approveForm, approvePending] = useActionState(aprobarAction, undefined)
  const [rejectState,  rejectForm,  rejectPending]  = useActionState(rechazarAction, undefined)

  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-gray-900">{req.employees?.full_name}</p>
          <p className="text-sm text-gray-600 mt-0.5">
            {fmt(req.start_date)} → {fmt(req.end_date)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {req.working_days} {req.working_days === 1 ? 'día hábil' : 'días hábiles'}
            {req.conflict && (
              <span className="ml-2 text-orange-500 font-medium">⚠ Posible solapamiento</span>
            )}
          </p>
          {req.admin_notes && (
            <p className="text-xs text-gray-400 mt-1 italic">Nota: "{req.admin_notes}"</p>
          )}
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 shrink-0">
          Pendiente
        </span>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <input
            form={`approve-${req.id}`}
            name="admin_notes"
            placeholder="Nota opcional…"
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <form id={`approve-${req.id}`} action={approveForm}>
          <button
            type="submit"
            disabled={approvePending}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Aprobar
          </button>
        </form>
        <form action={rejectForm}>
          <input type="hidden" name="admin_notes" value="" />
          <button
            type="submit"
            disabled={rejectPending}
            className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            Rechazar
          </button>
        </form>
      </div>

      {(approveState?.error || rejectState?.error) && (
        <p className="text-sm text-red-600">{approveState?.error || rejectState?.error}</p>
      )}
    </div>
  )
}

export default function SolicitudesPendientes({ requests, aprobarActions, rechazarActions }) {
  if (!requests.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No hay solicitudes pendientes.</p>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((req, i) => (
        <RequestRow
          key={req.id}
          req={req}
          aprobarAction={aprobarActions[i]}
          rechazarAction={rechazarActions[i]}
        />
      ))}
    </div>
  )
}
