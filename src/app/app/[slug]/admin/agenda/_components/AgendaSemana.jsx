import { minToLabel } from '@/lib/agenda'
import { estiloDe } from './estados'

const PX_POR_MIN = 1.2 // algo más compacto que la vista día (7 columnas a la vez)

export default function AgendaSemana({ dias, ejeInicio, ejeFin }) {
  const alturaTotal = (ejeFin - ejeInicio) * PX_POR_MIN
  const horas = []
  for (let m = ejeInicio; m <= ejeFin; m += 60) horas.push(m)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px]">
        {/* Cabecera de días */}
        <div className="flex border-b border-gray-100">
          <div className="w-12 shrink-0" />
          {dias.map(d => (
            <div
              key={d.date}
              className={`flex-1 text-center py-2 ${d.esHoy ? 'bg-blue-50' : ''}`}
            >
              <p className={`text-xs uppercase tracking-wide ${d.esHoy ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                {d.nombreCorto}
              </p>
              <div className={`mx-auto flex items-center justify-center rounded-full text-sm font-medium
                ${d.esHoy ? 'bg-red-500 text-white w-7 h-7' : 'text-gray-700 w-7 h-7'}`}>
                {d.numero}
              </div>
            </div>
          ))}
        </div>

        {/* Cuerpo: eje de horas + 7 columnas */}
        <div className="flex">
          <div className="relative w-12 shrink-0" style={{ height: alturaTotal }}>
            {horas.map(m => (
              <div
                key={m}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-gray-400 tabular-nums"
                style={{ top: (m - ejeInicio) * PX_POR_MIN }}
              >
                {minToLabel(m)}
              </div>
            ))}
          </div>

          {dias.map(d => (
            <div
              key={d.date}
              className={`relative flex-1 border-l border-gray-100 ${d.esHoy ? 'bg-blue-50/30' : ''}`}
              style={{ height: alturaTotal }}
            >
              {/* líneas de hora */}
              {horas.map(m => (
                <div
                  key={m}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: (m - ejeInicio) * PX_POR_MIN }}
                />
              ))}

              {/* pausa de comida del día */}
              {d.pausa && (
                <div
                  className="absolute left-0 right-0 bg-gray-50 border-y border-dashed border-gray-200"
                  style={{
                    top: (d.pausa.inicio - ejeInicio) * PX_POR_MIN,
                    height: (d.pausa.fin - d.pausa.inicio) * PX_POR_MIN,
                  }}
                />
              )}

              {/* bloques */}
              {d.eventos.map(ev => {
                const est = estiloDe(ev.estado)
                const gap = 2
                const widthPct = 100 / ev.totalCols
                const top = (ev.inicio - ejeInicio) * PX_POR_MIN
                const height = Math.max(ev.dur * PX_POR_MIN, 30)
                return (
                  <div
                    key={ev.id}
                    className={`absolute rounded-md border px-1 py-0.5 overflow-hidden ${est.box}`}
                    style={{
                      top,
                      height: height - 2,
                      left: `calc(${ev.col * widthPct}% + ${gap / 2}px)`,
                      width: `calc(${widthPct}% - ${gap}px)`,
                    }}
                    title={`${minToLabel(ev.inicio)} · ${ev.servicio} · ${ev.cliente}${ev.empleado ? ` · ${ev.empleado}` : ''}`}
                  >
                    <p className={`text-[11px] font-semibold leading-tight truncate ${est.txt}`}>
                      <span className="tabular-nums">{minToLabel(ev.inicio)}</span>
                    </p>
                    <p className={`text-[11px] leading-tight truncate ${est.sub}`}>{ev.servicio}</p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
