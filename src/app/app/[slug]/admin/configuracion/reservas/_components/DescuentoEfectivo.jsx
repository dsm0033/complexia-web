'use client'

import { useActionState } from 'react'

export default function DescuentoEfectivo({ settings, action }) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Descuento por pago en efectivo</h2>
      <p className="text-sm text-gray-500 mb-5">
        Si lo activas, los clientes verán el precio rebajado al elegir pagar en el local.
        Déjalo vacío para desactivarlo.
      </p>

      <form action={formAction} className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descuento (%)
            </label>
            <div className="relative">
              <input
                type="number"
                name="cash_payment_discount"
                defaultValue={settings?.cash_payment_discount ?? ''}
                min={0}
                max={100}
                placeholder="—"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Vacío = sin descuento</p>
          </div>

          {settings?.cash_payment_discount > 0 && (
            <div className="pb-6">
              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                Activo — {settings.cash_payment_discount}% de descuento
              </span>
            </div>
          )}
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
        )}
        {state?.ok && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">Descuento guardado.</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Guardando…' : 'Guardar descuento'}
          </button>
        </div>
      </form>
    </div>
  )
}
