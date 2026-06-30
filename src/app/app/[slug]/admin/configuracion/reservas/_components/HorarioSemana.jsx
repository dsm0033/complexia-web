'use client'

import { useActionState, useState } from 'react'

export default function HorarioSemana({ horario, action }) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const [openDays, setOpenDays] = useState(() =>
    Object.fromEntries(horario.map(d => [d.day_of_week, d.is_open]))
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Horario semanal</h2>
      <p className="text-sm text-gray-500 mb-5">
        Define cuándo trabaja el negocio. Los slots se generan automáticamente.
      </p>

      <form action={formAction} className="space-y-3">
        {horario.map(day => (
          <div key={day.day_of_week} className="grid grid-cols-[7rem_1fr] sm:grid-cols-[7rem_1fr] gap-3 items-start py-3 border-b border-gray-100 last:border-0">
            {/* Día + toggle */}
            <div className="flex items-center gap-2 pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name={`day_${day.day_of_week}_is_open`}
                  checked={openDays[day.day_of_week]}
                  onChange={e => setOpenDays(p => ({ ...p, [day.day_of_week]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
              <span className={`text-sm font-medium ${openDays[day.day_of_week] ? 'text-gray-900' : 'text-gray-400'}`}>
                {day.nombre}
              </span>
            </div>

            {/* Horas */}
            {openDays[day.day_of_week] ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Apertura</label>
                  <input
                    type="time"
                    name={`day_${day.day_of_week}_open_time`}
                    defaultValue={day.open_time}
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                  <input
                    type="time"
                    name={`day_${day.day_of_week}_close_time`}
                    defaultValue={day.close_time}
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Pausa inicio</label>
                  <input
                    type="time"
                    name={`day_${day.day_of_week}_lunch_start`}
                    defaultValue={day.lunch_break_start}
                    placeholder="—"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Pausa fin</label>
                  <input
                    type="time"
                    name={`day_${day.day_of_week}_lunch_end`}
                    defaultValue={day.lunch_break_end}
                    placeholder="—"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center pt-1">
                <span className="text-sm text-gray-400">Cerrado</span>
                {/* Campos ocultos para que el servidor reciba valores para días cerrados */}
                <input type="hidden" name={`day_${day.day_of_week}_open_time`}  value={day.open_time} />
                <input type="hidden" name={`day_${day.day_of_week}_close_time`} value={day.close_time} />
              </div>
            )}
          </div>
        ))}

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
        )}
        {state?.ok && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">Horario guardado.</p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Guardando…' : 'Guardar horario'}
          </button>
        </div>
      </form>
    </div>
  )
}
