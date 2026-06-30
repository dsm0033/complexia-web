'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DOW    = ['L','M','X','J','V','S','D']

function firstOffset(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export default function DatePicker({ label, name, value, onChange, min = '' }) {
  const today = new Date().toISOString().split('T')[0]
  const disableBefore = min || today

  const [open, setOpen]   = useState(false)
  const [year, setYear]   = useState(() => {
    const d = value ? new Date(value) : new Date()
    return d.getFullYear()
  })
  const [month, setMonth] = useState(() => {
    const d = value ? new Date(value) : new Date()
    return d.getMonth()
  })

  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Sync view to selected value when it changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value)
      setYear(d.getFullYear())
      setMonth(d.getMonth())
    }
  }, [value])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  function handleSelect(dateStr) {
    onChange(dateStr)
    setOpen(false)
  }

  const displayValue = value
    ? new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  const offset  = firstOffset(year, month)
  const numDays = daysInMonth(year, month)

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 bg-fondo border border-borde rounded-lg text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-dorado hover:border-dorado/40 transition-colors"
      >
        <span className={value ? 'text-texto' : 'text-muted/50'}>
          {displayValue || 'dd/mm/aaaa'}
        </span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {/* Hidden input para el form */}
      <input type="hidden" name={name} value={value} />

      {/* Calendario desplegable */}
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-tarjeta border border-borde rounded-2xl p-4 shadow-2xl w-64">

          {/* Navegación mes */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 rounded-lg text-muted hover:text-texto hover:bg-borde transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-texto">{MONTHS[month]} {year}</span>
            <button type="button" onClick={nextMonth} className="p-1 rounded-lg text-muted hover:text-texto hover:bg-borde transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Cabecera días semana */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map(d => (
              <div key={d} className="text-center text-[11px] text-muted/50 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Grid días */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: offset }).map((_, i) => <div key={`g-${i}`} />)}
            {Array.from({ length: numDays }).map((_, i) => {
              const day     = i + 1
              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const disabled = dateStr <= disableBefore
              const selected = dateStr === value
              const isWknd   = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6

              let cls = 'text-center text-sm py-1.5 w-full rounded-lg transition-colors '
              if (disabled)  cls += 'text-muted/30 cursor-not-allowed'
              else if (selected) cls += 'bg-dorado text-fondo font-bold cursor-pointer'
              else if (isWknd)   cls += 'text-muted/60 hover:bg-borde cursor-pointer'
              else               cls += 'text-texto hover:bg-borde cursor-pointer'

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(dateStr)}
                  className={cls}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
