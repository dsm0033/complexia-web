'use client'

import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DOW    = ['L','M','X','J','V','S','D']

function toStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

function firstDayOffset(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1  // Monday-first
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export default function RangeCalendar({
  start, end, hovered, month, year,
  onDayClick, onDayHover, onDayLeave,
  onPrevMonth, onNextMonth,
  open, onToggle,
}) {
  const ref = useRef(null)
  const today = toStr(new Date())

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onToggle()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onToggle])

  const displayLabel = () => {
    if (start && end) {
      const fmt = d => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      return `${fmt(start)} → ${fmt(end)}`
    }
    if (start) return 'Selecciona fecha de fin…'
    return 'Selecciona un rango de fechas'
  }

  const offset  = firstDayOffset(year, month)
  const numDays = daysInMonth(year, month)

  function dayClass(dateStr) {
    const isPast    = dateStr <= today
    const isStart   = dateStr === start
    const isEnd     = dateStr === end
    const previewTo = end || hovered
    const inRange   = start && previewTo && dateStr > start && dateStr < (end || hovered)
    const isWknd    = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6

    if (isPast) return 'text-muted/30 cursor-not-allowed'
    if (isStart || isEnd) return 'bg-dorado text-fondo font-bold rounded-lg'
    if (inRange) return isWknd
      ? 'bg-dorado/10 text-dorado/30'
      : 'bg-dorado/20 text-dorado'
    if (isWknd) return 'text-muted/60 hover:bg-borde rounded-lg'
    return 'text-texto hover:bg-borde rounded-lg'
  }

  const previewDays = (() => {
    const target = end || hovered
    if (!start || !target || target <= start) return null
    let n = 0
    const cur = new Date(start)
    const fin = new Date(target)
    while (cur <= fin) { if (cur.getDay() !== 0 && cur.getDay() !== 6) n++; cur.setDate(cur.getDate()+1) }
    return n
  })()

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 bg-fondo border border-borde rounded-xl text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-dorado transition-colors hover:border-dorado/40"
      >
        <span className={start ? 'text-texto' : 'text-muted/50'}>{displayLabel()}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-tarjeta border border-borde rounded-2xl p-4 shadow-2xl w-72">

          {/* Nav mes */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={onPrevMonth} className="p-1 rounded-lg text-muted hover:text-texto hover:bg-borde transition-colors">
              <ChevronLeft size={17} />
            </button>
            <span className="text-sm font-semibold text-texto">{MONTHS[month]} {year}</span>
            <button type="button" onClick={onNextMonth} className="p-1 rounded-lg text-muted hover:text-texto hover:bg-borde transition-colors">
              <ChevronRight size={17} />
            </button>
          </div>

          {/* Cabecera días */}
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
              const isPast  = dateStr <= today
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && onDayClick(dateStr)}
                  onMouseEnter={() => !isPast && onDayHover(dateStr)}
                  onMouseLeave={onDayLeave}
                  className={`text-center text-sm py-1.5 w-full transition-colors ${dayClass(dateStr)}`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Estado */}
          <div className="mt-3 text-center min-h-[20px]">
            {previewDays !== null && (
              <p className="text-xs text-dorado">
                {previewDays} {previewDays === 1 ? 'día hábil' : 'días hábiles'}
              </p>
            )}
            {!start && (
              <p className="text-xs text-muted/50">Haz clic en el día de inicio</p>
            )}
            {start && !end && !hovered && (
              <p className="text-xs text-muted/50">Ahora selecciona el día de fin</p>
            )}
          </div>

          {/* Reset */}
          {(start || end) && (
            <button
              type="button"
              onClick={() => { onDayClick('__reset__') }}
              className="w-full mt-2 text-xs text-muted/50 hover:text-red-400 transition-colors"
            >
              Limpiar selección
            </button>
          )}
        </div>
      )}
    </div>
  )
}
