'use client'

import { useState, useTransition } from 'react'
import { Mail, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { enviarFacturaPorEmail } from '../actions'

export function EnviarFacturaBtn({ invoiceId, customerEmail, emailSentAt }) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState(emailSentAt ? 'ok' : null) // null | 'ok' | 'error'

  if (!customerEmail) return null

  function handleClick() {
    setStatus(null)
    startTransition(async () => {
      const res = await enviarFacturaPorEmail(invoiceId)
      setStatus(res.ok ? 'ok' : 'error')
    })
  }

  if (status === 'ok') {
    const fecha = emailSentAt
      ? new Date(emailSentAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
      : 'hoy'
    return (
      <button
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-gray-500 transition-colors disabled:opacity-50"
        title="Reenviar"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        Enviado {fecha}
      </button>
    )
  }

  if (status === 'error') {
    return (
      <button
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
        title="Reintentar"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <AlertCircle size={14} />}
        Error — reintentar
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
      title={`Enviar a ${customerEmail}`}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
      Email
    </button>
  )
}
