'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isoLocal } from '@/lib/agenda'

const VISTAS = [
  { value: 'dia',    label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes',    label: 'Mes' },
]

export default function VistaNav({ date, vista }) {
  const router = useRouter()
  const go = (v, d) => router.push(`/admin/agenda?vista=${v}&date=${d}`)

  // ‹ › avanza según la vista: 1 día / 7 días / 1 mes
  const shift = n => {
    const d = new Date(date + 'T12:00:00')
    if (vista === 'mes') d.setMonth(d.getMonth() + n)
    else if (vista === 'semana') d.setDate(d.getDate() + n * 7)
    else d.setDate(d.getDate() + n)
    go(vista, isoLocal(d))
  }

  const navBtn = 'p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Selector de vista */}
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {VISTAS.map(v => (
          <button
            key={v.value}
            onClick={() => go(v.value, date)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              vista === v.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Navegación temporal */}
      <button onClick={() => shift(-1)} aria-label="Anterior" className={navBtn}>
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => go(vista, isoLocal(new Date()))}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Hoy
      </button>
      <button onClick={() => shift(1)} aria-label="Siguiente" className={navBtn}>
        <ChevronRight size={16} />
      </button>

      <input
        type="date"
        value={date}
        onChange={e => go(vista, e.target.value)}
        onClick={e => { try { e.currentTarget.showPicker?.() } catch {} }}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
