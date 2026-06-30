'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Navegación por mes (?mes=YYYY-MM), misma convención que admin/nominas.
// Usa usePathname para preservar la ruta → sirve en /empleado/calendario y en
// /admin/empleados/[id]/calendario sin parametrizar la URL base.
export default function MesNav({ mes }) {
  const router = useRouter()
  const pathname = usePathname()
  const go = m => router.push(`${pathname}?mes=${m}`)

  const shift = n => {
    const [y, mo] = mes.split('-').map(Number)
    const d = new Date(y, mo - 1 + n, 1)
    go(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const hoy = new Date()
  const mesHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const navBtn = 'p-2 rounded-lg border border-borde text-muted hover:bg-tarjeta transition-colors'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => shift(-1)} aria-label="Mes anterior" className={navBtn}>
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => go(mesHoy)}
        className="px-3 py-2 rounded-lg border border-borde text-sm font-medium text-texto hover:bg-tarjeta transition-colors"
      >
        Hoy
      </button>
      <button onClick={() => shift(1)} aria-label="Mes siguiente" className={navBtn}>
        <ChevronRight size={16} />
      </button>
      <input
        type="month"
        value={mes}
        onChange={e => e.target.value && go(e.target.value)}
        className="border border-borde rounded-lg px-3 py-2 text-sm bg-transparent text-texto focus:outline-none focus:ring-2 focus:ring-dorado"
      />
    </div>
  )
}
