'use client'

import { useState, useEffect } from 'react'
import { Palmtree, X, Clock } from 'lucide-react'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_PILLS = 3

const dotStatus = s => (s === 'completado' ? 'bg-emerald-500' : 'bg-amber-500')
const fechaLarga = date =>
  new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

export default function CalendarioEmpleado({ celdas }) {
  const [sel, setSel] = useState(null)

  // Cerrar el modal con Escape
  useEffect(() => {
    if (!sel) return
    const onKey = e => e.key === 'Escape' && setSel(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sel])

  const tieneDetalle = c => c.trabajos.length > 0 || c.vacacion || c.festivo

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-borde overflow-hidden bg-tarjeta">
        {/* Cabecera días de la semana */}
        <div className="grid grid-cols-7 border-b border-borde">
          {DIAS.map(d => (
            <div key={d} className="py-2 text-center text-xs uppercase tracking-wide text-muted">
              {d}
            </div>
          ))}
        </div>

        {/* Cuadrícula */}
        <div className="grid grid-cols-7">
          {celdas.map(c => {
            const fondo = c.vacacion
              ? 'bg-blue-500/10'
              : c.festivo
                ? 'bg-rose-500/10'
                : c.cerrado
                  ? 'bg-gray-500/5'
                  : ''
            const visibles = c.trabajos.slice(0, MAX_PILLS)
            const resto = c.trabajos.length - visibles.length
            const clicable = tieneDetalle(c)
            return (
              <button
                key={c.date}
                type="button"
                onClick={() => clicable && setSel(c)}
                disabled={!clicable}
                className={`min-h-[60px] sm:min-h-[96px] text-left border-b border-r border-borde p-1 sm:p-1.5 flex flex-col gap-0.5 sm:gap-1 transition-colors
                  ${fondo} ${c.enMes ? '' : 'opacity-40'} ${clicable ? 'hover:bg-dorado/5 cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`text-xs font-medium self-start rounded-full flex items-center justify-center
                    ${c.esHoy ? 'bg-red-500 text-white w-7 h-7' : 'text-texto px-1 sm:px-1.5 py-0.5'}`}
                >
                  {c.numero}
                </span>

                {/* Móvil: puntos de trabajo (festivo/vacacion ya lo indica el fondo) */}
                <div className="flex flex-wrap gap-0.5 sm:hidden">
                  {c.trabajos.slice(0, 3).map((t, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStatus(t.status)}`} />
                  ))}
                  {c.trabajos.length > 3 && <span className="text-[9px] text-muted leading-none">+{c.trabajos.length - 3}</span>}
                </div>

                {/* Escritorio: pills con texto */}
                <div className="hidden sm:flex flex-col gap-0.5 min-w-0">
                  {c.festivo && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 truncate" title={c.festivo}>
                      {c.festivo}
                    </span>
                  )}
                  {c.vacacion && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
                      <Palmtree size={11} className="shrink-0" />
                      Vacaciones
                    </span>
                  )}
                  {visibles.map((t, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-muted truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStatus(t.status)}`} />
                      {t.hora && <span className="tabular-nums shrink-0">{t.hora}</span>}
                      <span className="truncate">{t.servicio}</span>
                    </span>
                  ))}
                  {resto > 0 && <span className="text-[11px] text-muted pl-2.5">+{resto} más</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted px-1">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] text-white font-bold">1</span> Hoy</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Trabajo pendiente</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Trabajo completado</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/20" /> Vacaciones</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500/20" /> Festivo / cierre</span>
      </div>

      {/* Modal detalle del día */}
      {sel && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSel(null)}
        >
          <div
            className="bg-tarjeta text-texto rounded-2xl border border-borde shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-borde">
              <h2 className="font-semibold first-letter:uppercase">{fechaLarga(sel.date)}</h2>
              <button onClick={() => setSel(null)} className="text-muted hover:text-texto" aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {sel.festivo && (
                <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-500/10 rounded-lg px-3 py-2">
                  Festivo / cierre: {sel.festivo}
                </div>
              )}
              {sel.vacacion && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded-lg px-3 py-2">
                  <Palmtree size={15} /> Día de vacaciones
                </div>
              )}

              {sel.trabajos.length === 0 ? (
                <p className="text-sm text-muted">No hay trabajos asignados este día.</p>
              ) : (
                <ul className="space-y-2">
                  {sel.trabajos.map((t, i) => (
                    <li key={i} className="flex items-center gap-3 border border-borde rounded-lg px-3 py-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotStatus(t.status)}`} />
                      <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums w-16 shrink-0">
                        <Clock size={13} className="text-muted" />
                        {t.hora ?? '—'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{t.servicio}</p>
                        <p className="text-xs text-muted">
                          {t.duracion ? `${t.duracion} min · ` : ''}
                          {t.status === 'completado' ? 'Completado' : 'Pendiente'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
