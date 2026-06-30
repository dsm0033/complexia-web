import Link from 'next/link'
import { minToLabel } from '@/lib/agenda'
import { estiloDe } from './estados'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_PILLS = 3

export default function AgendaMes({ celdas }) {
  return (
    <div>
      {/* Cabecera de días de la semana */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DIAS.map(d => (
          <div key={d} className="py-2 text-center text-xs uppercase tracking-wide text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7">
        {celdas.map(c => {
          const visibles = c.eventos.slice(0, MAX_PILLS)
          const resto = c.eventos.length - visibles.length
          return (
            <Link
              key={c.date}
              href={`/admin/agenda?vista=dia&date=${c.date}`}
              className={`min-h-[104px] border-b border-r border-gray-100 p-1.5 flex flex-col gap-1 transition-colors hover:bg-gray-50
                ${c.enMes ? '' : 'bg-gray-50/50'}`}
            >
              <span
                className={`text-xs font-medium self-start rounded-full flex items-center justify-center
                  ${c.esHoy ? 'bg-red-500 text-white w-7 h-7' : c.enMes ? 'text-gray-700 px-1.5 py-0.5' : 'text-gray-300 px-1.5 py-0.5'}`}
              >
                {c.numero}
              </span>

              <div className="flex flex-col gap-0.5 min-w-0">
                {visibles.map(ev => {
                  const est = estiloDe(ev.estado)
                  return (
                    <span
                      key={ev.id}
                      className="flex items-center gap-1 text-[11px] text-gray-600 truncate"
                      title={`${minToLabel(ev.inicio)} · ${ev.servicio} · ${ev.cliente}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${est.dot}`} />
                      <span className="tabular-nums shrink-0">{minToLabel(ev.inicio)}</span>
                      <span className="truncate">{ev.servicio}</span>
                    </span>
                  )
                })}
                {resto > 0 && (
                  <span className="text-[11px] text-gray-400 pl-2.5">+{resto} más</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
