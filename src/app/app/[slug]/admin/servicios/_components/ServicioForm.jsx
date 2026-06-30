'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

const ICONOS = [
  { value: 'Wrench',    label: 'Llave inglesa' },
  { value: 'Car',       label: 'Coche' },
  { value: 'Armchair',  label: 'Sofá / Tapicería' },
  { value: 'Sparkles',  label: 'Brillo / Limpieza' },
  { value: 'Droplets',  label: 'Agua / Lavado' },
  { value: 'Gem',       label: 'Gema / Premium' },
  { value: 'Lightbulb', label: 'Bombilla / Faros' },
  { value: 'Shield',    label: 'Protección' },
  { value: 'Star',      label: 'Estrella' },
  { value: 'Brush',     label: 'Pintura / Cepillo' },
  { value: 'Wind',      label: 'Secado / Aire' },
  { value: 'Zap',       label: 'Rápido / Express' },
  { value: 'Settings',  label: 'Configuración / Ajuste' },
]

const VEHICLE_TYPES = [
  { key: 'turismo_pequeno', label: 'Turismo pequeño' },
  { key: 'turismo',         label: 'Turismo' },
  { key: 'suv',             label: 'SUV / 4x4 / Berlina / Sportwagon' },
  { key: 'furgoneta',       label: 'Furgoneta' },
  { key: 'caravana',        label: 'Caravana' },
]

function SubmitBtn({ label }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Guardando...' : label}
    </button>
  )
}

export function ServicioForm({ action, initialData, checklists = [], submitLabel }) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          defaultValue={initialData?.name}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          name="description"
          defaultValue={initialData?.description}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Precios por tipo de vehículo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precios por tipo de vehículo
          <span className="ml-1 text-gray-400 font-normal">(€ con IVA)</span>
        </label>
        <p className="text-xs text-gray-400 mb-3">
          El precio más bajo se usará como "desde X€" en la web pública.
        </p>
        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {VEHICLE_TYPES.map((v, i) => (
            <div key={v.key} className={`flex items-center gap-3 px-4 py-3 ${i === VEHICLE_TYPES.length - 1 ? 'bg-gray-50' : 'bg-white'}`}>
              <span className="w-36 text-sm text-gray-700">{v.label}</span>
              {i === VEHICLE_TYPES.length - 1 && (
                <span className="text-xs text-gray-400 italic mr-1">próximamente</span>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <input
                  name={`vp_${v.key}`}
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={initialData?.vehicle_pricing?.[v.key] ?? ''}
                  placeholder="—"
                  className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                />
                <span className="text-sm text-gray-400">€</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duración (min)
        </label>
        <input
          name="duration_minutes"
          type="number"
          min="1"
          step="1"
          defaultValue={initialData?.duration_minutes}
          className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
        <select
          name="icon"
          defaultValue={initialData?.icon ?? 'Wrench'}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ICONOS.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Checklist asociado <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <select
          name="checklist_id"
          defaultValue={initialData?.checklist_id ?? ''}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Sin checklist —</option>
          {checklists.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          name="highlight"
          id="highlight"
          defaultChecked={initialData?.highlight ?? false}
          className="w-4 h-4 accent-blue-600"
        />
        <label htmlFor="highlight" className="text-sm text-gray-700">
          Mostrar como destacado en la web
        </label>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SubmitBtn label={submitLabel} />
        <a href="/admin/servicios" className="text-sm text-gray-500 hover:text-gray-700">
          Cancelar
        </a>
      </div>
    </form>
  )
}
