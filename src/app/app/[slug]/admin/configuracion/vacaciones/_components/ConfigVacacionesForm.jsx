'use client'

import { useActionState } from 'react'

export default function ConfigVacacionesForm({ action, maxConcurrent, noticeDays }) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Máximo de empleados de vacaciones a la vez
          </label>
          <input
            type="number"
            name="max_concurrent_vacations"
            min="1"
            max="20"
            defaultValue={maxConcurrent ?? 1}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Antelación mínima para solicitar (días)
          </label>
          <input
            type="number"
            name="min_vacation_notice_days"
            min="1"
            max="180"
            defaultValue={noticeDays ?? 30}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Art. 38 ET: el empleado debe conocer sus fechas con 2 meses de antelación.
          </p>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Guardando…' : 'Guardar configuración'}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok    && <p className="text-sm text-green-600">Guardado correctamente.</p>}
    </form>
  )
}
