'use client'

import { useRouter, usePathname } from 'next/navigation'

const TRIMESTRES = [
  { value: 1, label: 'T1 · Ene–Mar' },
  { value: 2, label: 'T2 · Abr–Jun' },
  { value: 3, label: 'T3 · Jul–Sep' },
  { value: 4, label: 'T4 · Oct–Dic' },
]

export default function TrimestreSelector({ year, trimestre, years }) {
  const router = useRouter()
  const pathname = usePathname()
  const go = (y, t) =>
    router.push(`${pathname}?year=${y}&trimestre=${t}`)

  const selectClass =
    'border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="flex items-center gap-2">
      <select
        value={trimestre}
        onChange={e => go(year, e.target.value)}
        className={selectClass}
        aria-label="Trimestre"
      >
        {TRIMESTRES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <select
        value={year}
        onChange={e => go(e.target.value, trimestre)}
        className={selectClass}
        aria-label="Año"
      >
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}
