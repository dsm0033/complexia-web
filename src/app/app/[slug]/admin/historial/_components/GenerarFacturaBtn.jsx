'use client'

import { useFormStatus } from 'react-dom'
import { generarFacturaEfectivo } from '../actions'

function Btn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
      title="Generar factura"
    >
      {pending ? '...' : 'Fact.'}
    </button>
  )
}

export function GenerarFacturaBtn({ id }) {
  return (
    <form action={generarFacturaEfectivo.bind(null, id)} className="inline">
      <Btn />
    </form>
  )
}
