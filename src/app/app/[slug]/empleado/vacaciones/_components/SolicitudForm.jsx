'use client'

import { useActionState, useState } from 'react'
import DatePicker from './DatePicker'

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

export default function SolicitudForm({ action, minDate = '', noticeDays = 30 }) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const [start, setStart] = useState('')
  const [end,   setEnd]   = useState('')

  function handleStartChange(date) {
    setStart(date)
    if (end && end <= date) setEnd('')
  }

  const days = countWorkingDays(start, end)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePicker
          label="Fecha inicio"
          name="start_date"
          value={start}
          onChange={handleStartChange}
          min={minDate}
        />
        <DatePicker
          label="Fecha fin"
          name="end_date"
          value={end}
          onChange={setEnd}
          min={start}
        />
      </div>

      {days > 0 && (
        <p className="text-sm text-dorado">
          {days} {days === 1 ? 'día hábil' : 'días hábiles'} seleccionados
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !start || !end}
        className="w-full sm:w-auto px-5 py-2 bg-dorado text-fondo text-sm font-semibold rounded-lg hover:bg-dorado/90 disabled:opacity-40 transition-colors"
      >
        {pending ? 'Enviando…' : 'Solicitar vacaciones'}
      </button>

      {state?.error && (
        <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-400 bg-green-900/20 px-3 py-2 rounded-lg">
          Solicitud enviada — {state.working_days} días hábiles pendientes de aprobación.
        </p>
      )}
    </form>
  )
}
