'use client'

import { useTransition } from 'react'

export function EliminarBtn({ action, label = 'elemento' }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`¿Eliminar este ${label}? Esta acción no se puede deshacer.`)) return
    startTransition(() => action())
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-red-500 hover:text-red-700 text-sm disabled:opacity-40 transition-colors"
    >
      {pending ? '...' : 'Eliminar'}
    </button>
  )
}
