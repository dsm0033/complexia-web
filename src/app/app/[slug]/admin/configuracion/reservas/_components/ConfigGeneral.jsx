'use client'

import { useActionState } from 'react'

export default function ConfigGeneral({ settings, action }) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Configuración general</h2>
      <p className="text-sm text-gray-500 mb-5">
        Cuántos servicios simultáneos admites y con cuánta antelación se puede reservar.
      </p>

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración de slot (min)
            </label>
            <input
              type="number"
              name="slot_duration_minutes"
              defaultValue={settings?.slot_duration_minutes ?? 60}
              min={15}
              max={480}
              step={15}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Intervalo entre franjas horarias</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicios simultáneos
            </label>
            <input
              type="number"
              name="max_concurrent_bookings"
              defaultValue={settings?.max_concurrent_bookings ?? 1}
              min={1}
              max={20}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Reservas por franja horaria</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antelación máxima (días)
            </label>
            <input
              type="number"
              name="booking_advance_days"
              defaultValue={settings?.booking_advance_days ?? 60}
              min={1}
              max={365}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Días vista en el calendario</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aviso mínimo (horas)
            </label>
            <input
              type="number"
              name="min_booking_notice_hours"
              defaultValue={settings?.min_booking_notice_hours ?? 24}
              min={1}
              max={168}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Antelación mínima para reservar</p>
          </div>

        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
        )}
        {state?.ok && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">Configuración guardada.</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
