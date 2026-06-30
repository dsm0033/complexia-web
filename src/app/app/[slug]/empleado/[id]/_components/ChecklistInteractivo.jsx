'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronRight, Pause, Play } from 'lucide-react'
import Link from 'next/link'
import { actualizarProgreso, completarTrabajo, iniciarTrabajo } from '../../actions'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function ChecklistInteractivo({ recordId, items, initialProgress, duration, status, startedAt, slug }) {
  const [checked, setChecked] = useState(() => new Set(initialProgress))
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(!!startedAt)
  const [saving, setSaving] = useState(false)
  const [completado, setCompletado] = useState(status === 'completado')
  const [openSections, setOpenSections] = useState({})

  const sections = items.reduce((acc, item, idx) => {
    const sec = item.section ?? 'General'
    if (!acc[sec]) acc[sec] = []
    acc[sec].push({ ...item, idx })
    return acc
  }, {})

  useEffect(() => {
    const initial = {}
    Object.keys(sections).forEach((s) => { initial[s] = true })
    setOpenSections(initial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [running])

  const total = items.length
  const done = checked.size
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const toggle = async (idx) => {
    if (completado || saving) return
    const next = new Set(checked)
    if (next.has(idx)) next.delete(idx)
    else next.add(idx)
    setChecked(next)

    if (!hasStarted && next.size > 0) {
      setHasStarted(true)
      setRunning(true)
      iniciarTrabajo(recordId)
    } else if (hasStarted && !running) {
      setRunning(true)
    }

    setSaving(true)
    await actualizarProgreso(recordId, Array.from(next))
    setSaving(false)
  }

  const handleCompletar = async () => {
    if (saving) return
    const ok = confirm('¿Marcar este trabajo como completado?')
    if (!ok) return
    setSaving(true)
    setRunning(false)
    await completarTrabajo(recordId)
    setCompletado(true)
    setSaving(false)
  }

  const toggleSection = (name) => {
    setOpenSections((o) => ({ ...o, [name]: !o[name] }))
  }

  return (
    <div>
      {/* Barra de progreso + cronómetro */}
      <div className="bg-tarjeta rounded-xl border border-borde p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted">{done} / {total} pasos</span>
          <div className="flex items-center gap-2">
            <Clock size={14} color="#8A9AAC" />
            <span className="text-sm font-mono text-texto">{formatTime(seconds)}</span>
            {hasStarted && !completado && (
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-borde text-dorado hover:bg-dorado hover:text-fondo transition-colors"
              >
                {running ? <Pause size={12} /> : <Play size={12} />}
                {running ? 'Pausar' : 'Reanudar'}
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-borde rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              backgroundColor: pct === 100 ? '#22c55e' : 'hsl(var(--hsl-dorado))',
            }}
          />
        </div>
        <p className="text-xs text-muted mt-1 text-right">{pct}%</p>
      </div>

      {/* Checklist por secciones */}
      <div className="space-y-3 mb-6">
        {Object.entries(sections).map(([secName, secItems]) => {
          const secDone = secItems.filter((i) => checked.has(i.idx)).length
          const isOpen = openSections[secName] ?? true
          return (
            <div key={secName} className="bg-tarjeta rounded-xl border border-borde overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-borde transition-colors"
                onClick={() => toggleSection(secName)}
              >
                <div className="flex items-center gap-2">
                  {isOpen
                    ? <ChevronDown size={16} color="#8A9AAC" />
                    : <ChevronRight size={16} color="#8A9AAC" />
                  }
                  <span className="font-medium text-dorado">{secName}</span>
                </div>
                <span className="text-xs text-muted">{secDone}/{secItems.length}</span>
              </button>

              {isOpen && (
                <ul className="divide-y divide-borde">
                  {secItems.map((item) => {
                    const isChecked = checked.has(item.idx)
                    return (
                      <li key={item.idx}>
                        <button
                          onClick={() => toggle(item.idx)}
                          disabled={completado}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-borde disabled:cursor-default ${isChecked ? 'opacity-60' : ''}`}
                        >
                          {isChecked
                            ? <CheckCircle2 size={20} color="#22c55e" className="mt-0.5 shrink-0" />
                            : <Circle size={20} color="#8A9AAC" className="mt-0.5 shrink-0" />
                          }
                          <div className="flex-1">
                            <p className={`text-sm ${isChecked ? 'line-through text-muted' : 'text-texto'}`}>
                              {item.text}
                            </p>
                            {item.time && (
                              <p className="text-xs text-muted mt-0.5">{item.time}</p>
                            )}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* Estado final o botón completar */}
      {completado ? (
        <div className="text-center py-8">
          <CheckCircle2 size={52} color="#22c55e" className="mx-auto mb-3" />
          <p className="text-xl font-semibold text-texto">¡Trabajo completado!</p>
          <p className="text-sm text-muted mt-1">Tiempo total: {formatTime(seconds)}</p>
          <Link
            href={`/app/${slug}/empleado`}
            className="inline-block mt-6 px-6 py-3 bg-borde text-dorado rounded-xl font-medium hover:bg-dorado hover:text-fondo transition-colors"
          >
            Volver a mis trabajos
          </Link>
        </div>
      ) : (
        <button
          onClick={handleCompletar}
          disabled={saving || pct < 100}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            pct === 100
              ? 'bg-dorado text-fondo hover:bg-dorado-dim'
              : 'bg-borde text-muted cursor-not-allowed'
          }`}
        >
          {pct === 100 ? 'Marcar como completado' : `Completa todos los pasos (${pct}%)`}
        </button>
      )}
    </div>
  )
}
