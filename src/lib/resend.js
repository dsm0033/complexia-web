import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Remitente verificado en Resend. Centralizado aquí para no repetir el literal
// por todos los archivos de email y tener un único punto de cambio (FX-34).
export const DEFAULT_FROM_EMAIL = 'info@laimpecable.es'

// Construye el campo "from": nombre del negocio + remitente verificado.
export function emailFrom(business) {
  return `${business?.name ?? 'Impecable'} <${DEFAULT_FROM_EMAIL}>`
}
