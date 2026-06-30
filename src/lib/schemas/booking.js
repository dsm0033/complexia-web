import { z } from 'zod'

/**
 * Schema de validación para el formulario público de /reservar.
 *
 * Hoy lo usa actions/booking.js#crearReserva. Cuando el SaaS necesite otros
 * canales (API directa, WhatsApp bot, integraciones externas), pueden reutilizar
 * este schema en lugar de redefinir las reglas.
 *
 * Mensajes en español — se devuelven directamente al usuario en el formulario.
 */
export const BookingSchema = z.object({
  service_id: z
    .string({ required_error: 'Selecciona un servicio.' })
    .min(1, 'Selecciona un servicio.'),

  // Tipos válidos sincronizados con VEHICLE_TYPES de BookingForm.jsx.
  // El motor de precios degrada a precio base si no hay tarifa específica,
  // pero restringimos aquí para no almacenar valores arbitrarios (hallazgo B4).
  vehicle_type: z
    .enum(['turismo_pequeno', 'turismo', 'suv', 'furgoneta'], {
      required_error: 'Selecciona el tipo de vehículo.',
      invalid_type_error: 'Tipo de vehículo no válido.',
    }),

  customer_name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(120, 'El nombre es demasiado largo.'),

  license_plate: z
    .string({ required_error: 'La matrícula es obligatoria.' })
    .trim()
    .min(1, 'La matrícula es obligatoria.')
    .max(15, 'La matrícula no es válida.')
    // Las matrículas españolas no llevan espacios y se almacenan en mayúsculas
    .transform(v => v.toUpperCase().replace(/\s+/g, '')),

  customer_phone: z
    .string({ required_error: 'El teléfono es obligatorio.' })
    .trim()
    .min(9, 'El teléfono debe tener al menos 9 dígitos.')
    .max(20, 'El teléfono no es válido.')
    .transform(v => v.replace(/\s+/g, '')),

  // Email opcional: si el cliente lo deja vacío, queda null en BD.
  // Si lo escribe, validamos formato.
  customer_email: z
    .union([
      z.literal('').transform(() => null),
      z.string().trim().max(254, 'El email es demasiado largo.').email('El email no es válido.'),
    ])
    .optional()
    .nullable()
    .transform(v => v ?? null),

  date: z
    .string({ required_error: 'Selecciona una fecha.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha.'),

  time_slot: z
    .string({ required_error: 'Selecciona una hora válida.' })
    .regex(/^\d{2}:\d{2}$/, 'Selecciona una hora válida.'),

  payment_method: z
    .enum(['stripe', 'local'], { invalid_type_error: 'Método de pago inválido.' })
    .default('stripe'),
})

/**
 * Convierte un FormData en objeto plano y lo valida.
 * @returns {{ ok: true, data } | { ok: false, error: string }}
 */
export function parseBookingForm(formData) {
  const raw = Object.fromEntries(formData)
  const result = BookingSchema.safeParse(raw)
  if (!result.success) {
    // Devolvemos el primer mensaje legible — la UI solo muestra uno a la vez
    const first = result.error.issues[0]
    return { ok: false, error: first?.message ?? 'Datos del formulario inválidos.' }
  }
  return { ok: true, data: result.data }
}
