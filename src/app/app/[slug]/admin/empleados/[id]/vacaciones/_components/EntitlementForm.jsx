'use client'

import { useActionState } from 'react'

export default function EntitlementForm({ action, entitlement, year }) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="year" value={year} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Días hábiles anuales</label>
          <input
            type="number"
            name="total_days"
            min="1"
            max="50"
            defaultValue={entitlement?.total_days ?? 22}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Arrastre IT/maternidad</label>
          <input
            type="number"
            name="carryover_days"
            min="0"
            max="50"
            defaultValue={entitlement?.carryover_days ?? 0}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok    && <p className="text-sm text-green-600">Guardado correctamente.</p>}
    </form>
  )
}
