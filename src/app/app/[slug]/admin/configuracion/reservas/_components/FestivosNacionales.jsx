'use client'

import { useActionState, useState } from 'react'

const COMUNIDADES = [
  { code: 'AN', name: 'Andalucía' },
  { code: 'AR', name: 'Aragón' },
  { code: 'AS', name: 'Asturias' },
  { code: 'CB', name: 'Cantabria' },
  { code: 'CE', name: 'Ceuta' },
  { code: 'CL', name: 'Castilla y León' },
  { code: 'CM', name: 'Castilla-La Mancha' },
  { code: 'CN', name: 'Canarias' },
  { code: 'CT', name: 'Cataluña' },
  { code: 'EX', name: 'Extremadura' },
  { code: 'GA', name: 'Galicia' },
  { code: 'IB', name: 'Islas Baleares' },
  { code: 'MC', name: 'Región de Murcia' },
  { code: 'MD', name: 'Madrid' },
  { code: 'ML', name: 'Melilla' },
  { code: 'NC', name: 'Navarra' },
  { code: 'PV', name: 'País Vasco' },
  { code: 'RI', name: 'La Rioja' },
  { code: 'VC', name: 'Comunidad Valenciana' },
]

const currentYear = new Date().getFullYear()

export default function FestivosNacionales({ settings, blockedCount, actionOpciones, actionImportar }) {
  const [stateOpciones, formOpciones, pendingOpciones] = useActionState(actionOpciones, undefined)
  const [stateImportar, formImportar, pendingImportar] = useActionState(actionImportar, undefined)
  const [useHolidays, setUseHolidays] = useState(settings?.use_national_holidays ?? false)
  const [region, setRegion] = useState(settings?.holiday_region ?? '')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Calendario oficial español</h2>
      <p className="text-sm text-gray-500 mb-5">
        Importa los festivos nacionales y de tu comunidad para bloquearlos automáticamente.
        {blockedCount > 0 && (
          <span className="ml-2 text-blue-600 font-medium">{blockedCount} festivos importados</span>
        )}
      </p>

      {/* Opciones: activar + comunidad */}
      <form action={formOpciones} className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="use_national_holidays"
              checked={useHolidays}
              onChange={e => setUseHolidays(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
          <span className="text-sm font-medium text-gray-700">Usar calendario oficial español</span>
        </div>

        {useHolidays && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comunidad autónoma <span className="text-gray-400 font-normal">(opcional — añade festivos autonómicos)</span>
            </label>
            <select
              name="holiday_region"
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Solo festivos nacionales</option>
              {COMUNIDADES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {stateOpciones?.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{stateOpciones.error}</p>
        )}
        {stateOpciones?.ok && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">Opciones guardadas.</p>
        )}

        <button
          type="submit"
          disabled={pendingOpciones}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {pendingOpciones ? 'Guardando…' : 'Guardar opciones'}
        </button>
      </form>

      {/* Importar festivos por año */}
      {useHolidays && (
        <div className="border-t border-gray-100 pt-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Importar festivos</p>
          <form action={formImportar} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Año</label>
              <select
                name="year"
                defaultValue={currentYear}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <input type="hidden" name="region" value={region} />
            <button
              type="submit"
              disabled={pendingImportar}
              className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              {pendingImportar ? 'Importando…' : 'Importar festivos'}
            </button>
          </form>

          {stateImportar?.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-3">{stateImportar.error}</p>
          )}
          {stateImportar?.ok && (
            <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg mt-3">
              {stateImportar.count} festivos importados correctamente.
            </p>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Fuente: calendario oficial Nager.Date · Los festivos ya importados del año seleccionado se reemplazan.
            Los días bloqueados manualmente no se modifican.
          </p>
        </div>
      )}
    </div>
  )
}
