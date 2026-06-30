'use client'

import { useActionState, useState } from 'react'

function countWorkingDays(start, end) {
  if (!start || !end || end < start) return 0
  let n = 0
  const cur = new Date(start)
  const fin = new Date(end)
  while (cur <= fin) {
    const d = cur.getDay()
    if (d !== 0 && d !== 6) n++
    cur.setDate(cur.getDate() + 1)
  }
  return n
}

export default function ManualRequestForm({ action }) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const [start, setStart] = useState('')
  const [end,   setEnd]   = useState('')

  const days = countWorkingDays(start, end)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
          <input
            type="date"
            name="start_date"
            required
            value={start}
            onChange={e => { setStart(e.target.value); if (end && end < e.target.value) setEnd('') }}
            onClick={e => e.currentTarget.showPicker?.()}
            onFocus={e => e.currentTarget.showPicker?.()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
          <input
            type="date"
            name="end_date"
            required
            min={start}
            value={end}
            onChange={e => setEnd(e.target.value)}
            onClick={e => e.currentTarget.showPicker?.()}
            onFocus={e => e.currentTarget.showPicker?.()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {days > 0 && (
        <p className="text-sm text-blue-600 font-medium">
          {days} {days === 1 ? 'día hábil' : 'días hábiles'}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
        <input
          type="text"
          name="admin_notes"
          placeholder="Ej: Acuerdo verbal, urgencia familiar…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending || !start || !end}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Creando…' : 'Crear y aprobar vacaciones'}
      </button>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && (
        <p className="text-sm text-green-600">
          Vacaciones creadas — {state.working_days} días hábiles aprobados directamente.
        </p>
      )}
    </form>
  )
}
