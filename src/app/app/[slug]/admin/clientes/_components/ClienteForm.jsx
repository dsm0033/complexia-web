'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

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

export function ClienteForm({ action, initialData, submitLabel }) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          name="full_name"
          defaultValue={initialData?.full_name}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-gray-400 font-normal">(al menos uno de los dos)</span>
        </label>
        <input
          name="email"
          type="email"
          defaultValue={initialData?.email}
          pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono <span className="text-gray-400 font-normal">(al menos uno de los dos)</span>
        </label>
        <input
          name="phone"
          type="tel"
          defaultValue={initialData?.phone}
          pattern="[0-9\s\+\-\(\)]{6,20}"
          title="Solo números, espacios y los símbolos + - ( )"
          inputMode="numeric"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SubmitBtn label={submitLabel} />
        <a href="/admin/clientes" className="text-sm text-gray-500 hover:text-gray-700">
          Cancelar
        </a>
      </div>
    </form>
  )
}
