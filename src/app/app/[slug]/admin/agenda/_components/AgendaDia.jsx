import { User } from 'lucide-react'
import { minToLabel } from '@/lib/agenda'
import { estiloDe } from './estados'

// Píxeles por minuto del eje vertical. 1.4 → 84 px por hora: cómodo para leer
// el bloque más corto (servicios suelen ser de 60-120 min) sin alargar de más.
const PX_POR_MIN = 1.4

export default function AgendaDia({ eventos, ejeInicio, ejeFin, pausa }) {
  const alturaTotal = (ejeFin - ejeInicio) * PX_POR_MIN

  const horas = []
  for (let m = ejeInicio; m <= ejeFin; m += 60) horas.push(m)

  return (
    <div className="flex">
      {/* Columna de horas */}
      <div className="relative w-14 shrink-0" style={{ height: alturaTotal }}>
        {horas.map(m => (
          <div
            key={m}
            className="absolute right-2 -translate-y-1/2 text-xs text-gray-400 tabular-nums"
            style={{ top: (m - ejeInicio) * PX_POR_MIN }}
          >
            {minToLabel(m)}
          </div>
        ))}
      </div>

      {/* Área de eventos */}
      <div className="relative flex-1 border-l border-gray-100" style={{ height: alturaTotal }}>
        {/* Líneas horizontales por hora */}
        {horas.map(m => (
          <div
            key={m}
            className="absolute left-0 right-0 border-t border-gray-100"
            style={{ top: (m - ejeInicio) * PX_POR_MIN }}
          />
        ))}

        {/* Franja de pausa de comida */}
        {pausa && (
          <div
            className="absolute left-0 right-0 bg-gray-50 border-y border-dashed border-gray-200 flex items-center justify-center"
            style={{
              top: (pausa.inicio - ejeInicio) * PX_POR_MIN,
              height: (pausa.fin - pausa.inicio) * PX_POR_MIN,
            }}
          >
            <span className="text-[11px] text-gray-400 uppercase tracking-wide">Pausa</span>
          </div>
        )}

        {/* Bloques de reserva */}
        {eventos.map(ev => {
          const est = estiloDe(ev.estado)
          const gap = 4
          const widthPct = 100 / ev.totalCols
          const top = (ev.inicio - ejeInicio) * PX_POR_MIN
          const height = Math.max(ev.dur * PX_POR_MIN, 38)
          const compacto = height < 56
          return (
            <div
              key={ev.id}
              className={`absolute rounded-lg border px-2 py-1 overflow-hidden ${est.box}`}
              style={{
                top,
                height: height - 2,
                left: `calc(${ev.col * widthPct}% + ${gap / 2}px)`,
                width: `calc(${widthPct}% - ${gap}px)`,
              }}
              title={`${minToLabel(ev.inicio)} · ${ev.servicio} · ${ev.cliente}${ev.empleado ? ` · ${ev.empleado}` : ''}`}
            >
              <p className={`text-xs font-semibold leading-tight truncate ${est.txt}`}>
                <span className="tabular-nums">{minToLabel(ev.inicio)}</span> {ev.servicio}
              </p>
              {!compacto && (
                <>
                  <p className={`text-[11px] leading-tight truncate ${est.sub}`}>
                    {ev.cliente} · {ev.matricula}
                  </p>
                  {ev.empleado && (
                    <p className={`text-[11px] leading-tight truncate flex items-center gap-1 ${est.sub}`}>
                      <User size={10} className="shrink-0" />
                      {ev.empleado}
                    </p>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
