'use client'

import { useActionState } from 'react'
import { actualizarPerfil } from '../actions'

export default function PerfilForm({ customer, userEmail }) {
  const [state, action, pending] = useActionState(actualizarPerfil, undefined)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={userEmail}
          disabled
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">El email no se puede modificar</p>
      </div>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={customer.full_name}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-dorado"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={customer.phone ?? ''}
          pattern="[0-9\s\+\-]{7,15}"
          placeholder="600 000 000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-dorado"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Datos actualizados correctamente.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-dorado text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-dorado-dim disabled:opacity-50 transition-colors"
      >
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
