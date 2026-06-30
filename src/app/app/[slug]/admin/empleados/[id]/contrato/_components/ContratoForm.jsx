'use client'

import { useActionState, useState } from 'react'

export default function ContratoForm({ action, initialData, grupos }) {
  const [state, formAction, pending] = useActionState(action, null)
  const d = initialData || {}
  const [contractType, setContractType] = useState(d.contract_type || 'indefinido')

  return (
    <form action={formAction} className="space-y-8">

      {/* Tipo y vigencia */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Tipo y vigencia</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato</label>
            <select
              name="contract_type"
              value={contractType}
              onChange={e => setContractType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="indefinido">Indefinido</option>
              <option value="temporal">Temporal</option>
              <option value="formacion">Formación</option>
              <option value="practicas">Prácticas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
            <input
              type="date"
              name="start_date"
              defaultValue={d.start_date || ''}
              required
              onClick={e => e.currentTarget.showPicker?.()}
              onFocus={e => e.currentTarget.showPicker?.()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {contractType !== 'indefinido' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="date"
                name="end_date"
                defaultValue={d.end_date || ''}
                onClick={e => e.currentTarget.showPicker?.()}
                onFocus={e => e.currentTarget.showPicker?.()}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Retribución */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Retribución</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salario bruto anual (€)</label>
            <input
              type="number"
              name="gross_annual"
              defaultValue={d.gross_annual || ''}
              min="0.01"
              step="0.01"
              required
              placeholder="ej. 18000.00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de pagas</label>
            <select
              name="num_payments"
              defaultValue={d.num_payments || 14}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={14}>14 pagas — 12 mensuales + extra junio y diciembre</option>
              <option value={12}>12 pagas — sueldo prorrateado en mensualidades iguales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jornada */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Jornada</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas semanales</label>
            <input
              type="number"
              name="weekly_hours"
              defaultValue={d.weekly_hours ?? 37.5}
              min="1"
              max="37.5"
              step="0.5"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Máximo legal 2026: 37,5 h/semana</p>
          </div>
        </div>
      </div>

      {/* Seguridad Social */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Seguridad Social</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo de cotización</label>
            <select
              name="contribution_group"
              defaultValue={d.contribution_group || 9}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {grupos.map(g => (
                <option key={g.group_number} value={g.group_number}>
                  {`Grupo ${g.group_number} — ${g.name} (base mín. ${Number(g.min_base).toFixed(2)} €/${g.base_type === 'monthly' ? 'mes' : 'día'})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría profesional <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="category"
              defaultValue={d.category || ''}
              placeholder="ej. Operario de limpieza"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* IRPF */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">IRPF</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% Retención mensual</label>
            <input
              type="number"
              name="irpf_rate"
              defaultValue={d.irpf_rate ?? 0}
              min="0"
              max="47"
              step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">0 = calcular automáticamente según tramos 2026</p>
          </div>
        </div>
      </div>

      {/* Datos para el PDF de nómina */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Datos para la nómina PDF</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DNI / NIE <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="dni"
              defaultValue={d.dni || ''}
              placeholder="12345678A"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nº afiliación SS (NAF) <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="ss_affiliation"
              defaultValue={d.ss_affiliation || ''}
              placeholder="28 12345678 00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">Contrato guardado correctamente.</p>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Guardando…' : 'Guardar contrato'}
        </button>
      </div>
    </form>
  )
}
