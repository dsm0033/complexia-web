'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Guardando...' : 'Guardar IBAN'}
    </button>
  )
}

export default function IbanFormAdmin({ action, ibanActual }) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-3 max-w-md">
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-600">IBAN guardado correctamente.</p>
      )}
      <div>
        <input
          name="iban"
          defaultValue={ibanActual ?? ''}
          placeholder="ES12 2100 0418 4012 3456 7891"
          maxLength={29}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest"
        />
        <p className="text-xs text-gray-400 mt-1">ES seguido de 22 dígitos. Los espacios se ignoran.</p>
      </div>
      <SubmitBtn />
    </form>
  )
}
