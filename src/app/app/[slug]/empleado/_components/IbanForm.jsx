'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { actualizarIban } from '../actions'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium bg-dorado text-fondo rounded-lg hover:bg-dorado/90 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Guardando...' : 'Guardar IBAN'}
    </button>
  )
}

export default function IbanForm({ ibanActual }) {
  const [state, action] = useActionState(actualizarIban, null)

  return (
    <form action={action} className="space-y-3">
      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-400">IBAN guardado correctamente.</p>
      )}
      <div>
        <label className="block text-xs text-muted mb-1 uppercase tracking-wide">
          IBAN (cuenta donde recibir la nómina)
        </label>
        <input
          name="iban"
          defaultValue={ibanActual ?? ''}
          placeholder="ES12 2100 0418 4012 3456 7891"
          maxLength={29}
          className="w-full bg-fondo border border-borde rounded-lg px-3 py-2 text-sm text-texto placeholder:text-muted/30 focus:outline-none focus:border-dorado uppercase tracking-widest"
        />
        <p className="text-xs text-muted mt-1">Formato: ES seguido de 22 dígitos. Sin espacios o con ellos, da igual.</p>
      </div>
      <SubmitBtn />
    </form>
  )
}
