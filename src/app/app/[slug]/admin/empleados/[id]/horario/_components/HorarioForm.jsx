'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Guardando...' : 'Guardar horario'}
    </button>
  )
}

export function HorarioForm({ action, horario }) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-1">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          Horario guardado correctamente.
        </div>
      )}

      {/* Cabecera */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-2 pb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
        <span>Día</span>
        <span className="w-24 text-center">Horas / día</span>
        <span className="w-16 text-center">Libre</span>
      </div>

      {horario.map(({ day_of_week, nombre, contracted_minutes }) => {
        const horas = contracted_minutes > 0 ? (contracted_minutes / 60).toString() : ''
        const esLibre = contracted_minutes === 0
        return (
          <div
            key={day_of_week}
            className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-2 py-2.5 rounded-lg hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">{nombre}</span>

            <input
              type="number"
              name={`day_${day_of_week}_horas`}
              defaultValue={horas}
              min="0"
              max="24"
              step="0.5"
              placeholder="—"
              className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />

            <div className="w-16 flex justify-center">
              <span className={`text-xs px-2 py-0.5 rounded-full ${esLibre ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                {esLibre ? 'Libre' : `${contracted_minutes}min`}
              </span>
            </div>
          </div>
        )
      })}

      <div className="pt-4 border-t border-gray-100 mt-4 flex items-center gap-4">
        <SubmitBtn />
        <p className="text-xs text-gray-400">Pon 0 o deja vacío para marcar el día como libre</p>
      </div>
    </form>
  )
}
