'use client'

import { Fragment, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ChevronUp, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react'

/**
 * Tabla reutilizable con:
 *   - Buscador (con contador de resultados)
 *   - Sort por columnas vía query string (sortBy, sortDir)
 *   - Agrupación opcional año → mes con toggle abierto/cerrado persistido en
 *     localStorage por tabla (sobrevive a navegaciones como "editar gasto")
 *   - Vista plana automática al filtrar
 *
 * Props:
 *   data            — array de filas
 *   columns         — [{ key?, label, getValue?, sortable?, headerAlign?, className? }]
 *                     Sin `key` = columna no ordenable (header decorativo)
 *                     Con `key` y `getValue` = ordenable
 *   search          — { placeholder, fields }  fields: (row) => array de strings a buscar
 *   monthly         — opcional. Activa agrupación año/mes cuando sortBy === monthly.sortKey:
 *                     { dateField, sortKey, label: { singular, plural },
 *                       yearTotal?: (row) => number,   // suma € por año/mes
 *                       monthBadge?: (row) => boolean, // cuenta filas con badge ej. "pendientes"
 *                       badgeLabel?: { singular, plural }, // texto del badge
 *                       reverse?: boolean }            // orden desc (Gastos)
 *   renderRow       — (row) => <tr key=... />
 *   defaultSort     — { by, dir }
 *   minWidth        — número (px)
 *   hasActions      — boolean, añade <th /> vacío al final de la cabecera
 *   emptyState      — { title, message } cuando data está vacío
 *   persistKey      — string, identificador único de tabla para localStorage.
 *                     Si no se pasa, el estado abierto solo vive en memoria.
 */

// Año y mes actuales como defaults para la primera visita
function defaultOpenKeys() {
  const now = new Date()
  const year = String(now.getFullYear())
  const month = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return new Set([year, month])
}

function readPersistedKeys(persistKey) {
  if (typeof window === 'undefined' || !persistKey) return defaultOpenKeys()
  try {
    const raw = localStorage.getItem(`mt-${persistKey}`)
    if (raw === null) return defaultOpenKeys()
    return new Set(JSON.parse(raw))
  } catch {
    return defaultOpenKeys()
  }
}

export function SortableMonthlyTable({
  data,
  columns,
  search,
  monthly,
  renderRow,
  defaultSort = { by: columns[0]?.key, dir: 'asc' },
  minWidth,
  hasActions = false,
  emptyState,
  persistKey,
}) {
  const [query, setQuery] = useState('')
  const [openKeys, setOpenKeys] = useState(() => readPersistedKeys(persistKey))
  const router = useRouter()
  const searchParams = useSearchParams()

  const sortBy  = searchParams.get('sortBy')  ?? defaultSort.by
  const sortDir = searchParams.get('sortDir') ?? defaultSort.dir

  // Persiste el estado abierto cada vez que cambia
  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return
    try {
      localStorage.setItem(`mt-${persistKey}`, JSON.stringify([...openKeys]))
    } catch {
      // localStorage lleno o bloqueado — ignoramos, no rompe la UX
    }
  }, [openKeys, persistKey])

  function toggleKey(key) {
    setOpenKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleSort(col) {
    const params = new URLSearchParams(searchParams.toString())
    if (sortBy === col) {
      params.set('sortDir', sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      params.set('sortBy', col)
      params.set('sortDir', 'asc')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const filtered = query
    ? data.filter(row => {
        const q = query.toLowerCase()
        return search.fields(row).some(v => (v ?? '').toString().toLowerCase().includes(q))
      })
    : data

  const colDef = columns.find(c => c.key === sortBy)
  const sorted = colDef
    ? [...filtered].sort((a, b) => {
        const va = colDef.getValue(a)
        const vb = colDef.getValue(b)
        if (typeof va === 'string' && typeof vb === 'string') {
          const cmp = va.localeCompare(vb, 'es')
          return sortDir === 'asc' ? cmp : -cmp
        }
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    : filtered

  // Agrupación año/mes solo cuando se ordena por la sortKey monthly y no hay búsqueda
  const grouped = monthly && sortBy === monthly.sortKey && !query
  const yearMap = new Map()
  if (grouped) {
    sorted.forEach(row => {
      const date  = row[monthly.dateField]
      const year  = date.slice(0, 4)
      const month = date.slice(0, 7)
      if (!yearMap.has(year)) yearMap.set(year, new Map())
      const mMap = yearMap.get(year)
      if (!mMap.has(month)) mMap.set(month, [])
      mMap.get(month).push(row)
    })
  }

  const colSpan = columns.length + (hasActions ? 1 : 0)

  if (!data.length && emptyState) {
    return (
      <div className="p-12 text-center text-gray-400">
        <p className="text-lg font-medium">{emptyState.title}</p>
        {emptyState.message && <p className="text-sm mt-1">{emptyState.message}</p>}
      </div>
    )
  }

  return (
    <>
      {search && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={search.placeholder}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {query && (
            <p className="text-xs text-gray-400 mt-2">
              {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </p>
          )}
        </div>
      )}

      {query && filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <p className="text-sm">Sin resultados para &quot;{query}&quot;</p>
        </div>
      ) : (
        <table className="w-full" style={minWidth ? { minWidth: `${minWidth}px` } : undefined}>
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((col, i) => (
                <TableHeader
                  key={col.key ?? `static-${i}`}
                  col={col}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              ))}
              {hasActions && <th className="px-6 py-4" />}
            </tr>
          </thead>
          <tbody>
            {grouped
              ? renderGroupedBody({ yearMap, openKeys, toggleKey, monthly, renderRow, colSpan })
              : sorted.map(renderRow)
            }
          </tbody>
        </table>
      )}
    </>
  )
}

function TableHeader({ col, sortBy, sortDir, onSort }) {
  const isRight = col.headerAlign === 'right'
  const align   = isRight ? 'text-right' : 'text-left'
  const base    = `${align} px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide ${col.className ?? ''}`
  if (!col.key || !col.sortable) {
    return <th className={base}>{col.label}</th>
  }
  return (
    <th className={base}>
      <button
        onClick={() => onSort(col.key)}
        className={`flex items-center hover:text-gray-800 transition-colors ${isRight ? 'justify-end w-full' : ''}`}
      >
        {col.label}
        <SortIcon col={col.key} sortBy={sortBy} sortDir={sortDir} />
      </button>
    </th>
  )
}

function SortIcon({ col, sortBy, sortDir }) {
  if (sortBy !== col) return <ChevronsUpDown size={13} className="ml-1 text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="ml-1 text-blue-500" />
    : <ChevronDown size={13} className="ml-1 text-blue-500" />
}

function renderGroupedBody({ yearMap, openKeys, toggleKey, monthly, renderRow, colSpan }) {
  const yearEntries = [...yearMap.entries()]
  if (monthly.reverse) yearEntries.reverse()

  return yearEntries.map(([year, monthMap]) => {
    const yearOpen   = openKeys.has(year)
    const allRecords = [...monthMap.values()].flat()
    const yearCount  = allRecords.length
    const yearTotal  = monthly.yearTotal
      ? allRecords.reduce((n, r) => n + monthly.yearTotal(r), 0)
      : null
    const yearBadge  = monthly.monthBadge
      ? allRecords.filter(monthly.monthBadge).length
      : 0

    const label = yearCount === 1 ? monthly.label.singular : monthly.label.plural

    return (
      <Fragment key={year}>
        <tr className="bg-gray-100 border-y border-gray-200">
          <td colSpan={colSpan} className="px-4 py-2">
            <button
              onClick={() => toggleKey(year)}
              className="flex items-center gap-1.5 text-sm font-bold text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
            >
              {yearOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              {year}
              <span className="font-normal text-gray-400 normal-case tracking-normal ml-1">
                · {yearCount} {label}
                {yearTotal !== null && ` · ${yearTotal.toFixed(2)} €`}
              </span>
              {yearBadge > 0 && monthly.badgeLabel && (
                <span className="ml-2 bg-orange-100 text-orange-600 text-[11px] font-semibold px-2 py-0.5 rounded-full normal-case tracking-normal">
                  {yearBadge} {yearBadge === 1 ? monthly.badgeLabel.singular : monthly.badgeLabel.plural}
                </span>
              )}
            </button>
          </td>
        </tr>

        {yearOpen && renderMonths({ monthMap, openKeys, toggleKey, monthly, renderRow, colSpan })}
      </Fragment>
    )
  })
}

function renderMonths({ monthMap, openKeys, toggleKey, monthly, renderRow, colSpan }) {
  const monthEntries = [...monthMap.entries()]
  if (monthly.reverse) monthEntries.reverse()

  return monthEntries.map(([monthKey, records]) => {
    const monthOpen  = openKeys.has(monthKey)
    const monthTotal = monthly.yearTotal
      ? records.reduce((n, r) => n + monthly.yearTotal(r), 0)
      : null
    const monthBadge = monthly.monthBadge
      ? records.filter(monthly.monthBadge).length
      : 0

    const label = records.length === 1 ? monthly.label.singular : monthly.label.plural

    return (
      <Fragment key={monthKey}>
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan={colSpan} className="pl-10 pr-6 py-2">
            <button
              onClick={() => toggleKey(monthKey)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
            >
              {monthOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {monthLabel(monthKey)}
              <span className="font-normal normal-case tracking-normal ml-1">
                · {records.length} {label}
                {monthTotal !== null && ` · ${monthTotal.toFixed(2)} €`}
              </span>
              {monthBadge > 0 && monthly.badgeLabel && (
                <span className="ml-2 bg-orange-100 text-orange-600 text-[11px] font-semibold px-2 py-0.5 rounded-full normal-case tracking-normal">
                  {monthBadge} {monthBadge === 1 ? monthly.badgeLabel.singular : monthly.badgeLabel.plural}
                </span>
              )}
            </button>
          </td>
        </tr>
        {monthOpen && records.map(renderRow)}
      </Fragment>
    )
  })
}

function monthLabel(key) {
  const [year, month] = key.split('-')
  const label = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('es-ES', { month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
