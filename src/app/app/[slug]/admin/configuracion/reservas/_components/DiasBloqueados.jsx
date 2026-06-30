'use client'

import { useActionState } from 'react'

const SOURCE_LABELS = {
  manual:            { label: 'Manual',   style: 'bg-gray-100 text-gray-700' },
  national_holiday:  { label: 'Nacional',  style: 'bg-blue-100 text-blue-700' },
  regional_holiday:  { label: 'Autonómico', style: 'bg-indigo-100 text-indigo-700' },
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function DeleteButton({ id, action }) {
  const [, formAction, pending] = useActionState(action, undefined)
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
      >
        {pending ? '…' : 'Quitar'}
      </button>
    </form>
  )
}

export default function DiasBloqueados({ dates, actionBloquear, actionDesbloquear }) {
  const [state, formAction, pending] = useActionState(actionBloquear, undefined)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Días bloqueados</h2>
      <p className="text-sm text-gray-500 mb-5">
        Fechas no disponibles para reservas: festivos importados y cierres puntuales manuales.
      </p>

      {/* Añadir fecha manual */}
      <form action={formAction} className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha</label>
          <input
            type="date"
            name="date"
            required
            onClick={e => e.currentTarget.showPicker?.()}
            onFocus={e => e.currentTarget.showPicker?.()}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-gray-500 mb-1">Motivo (opcional)</label>
          <input
            type="text"
            name="reason"
            placeholder="Ej: Vacaciones agosto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Añadiendo…' : 'Bloquear fecha'}
        </button>
      </form>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-4">Fecha bloqueada.</p>
      )}

      {/* Lista de fechas bloqueadas */}
      {!dates.length ? (
        <p className="text-sm text-gray-400 text-center py-6">No hay fechas bloqueadas.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {dates.map(d => {
            const src = SOURCE_LABELS[d.source] ?? SOURCE_LABELS.manual
            return (
              <div key={d.id} className="flex items-center justify-between py-2.5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${src.style}`}>
                    {src.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900">{formatDate(d.date)}</p>
                    {d.reason && (
                      <p className="text-xs text-gray-400 truncate">{d.reason}</p>
                    )}
                  </div>
                </div>
                <DeleteButton id={d.id} action={actionDesbloquear} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
