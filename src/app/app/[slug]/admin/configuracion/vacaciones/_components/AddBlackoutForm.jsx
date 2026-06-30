'use client'

import { useActionState } from 'react'

export default function AddBlackoutForm({ action }) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
          <input
            type="date"
            name="start_date"
            required
            onClick={e => e.currentTarget.showPicker?.()}
            onFocus={e => e.currentTarget.showPicker?.()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
          <input
            type="date"
            name="end_date"
            required
            onClick={e => e.currentTarget.showPicker?.()}
            onFocus={e => e.currentTarget.showPicker?.()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
          <input
            type="text"
            name="reason"
            required
            placeholder="Ej: Semana Santa"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Añadiendo…' : 'Añadir período bloqueado'}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok    && <p className="text-sm text-green-600">Período añadido correctamente.</p>}
    </form>
  )
}
