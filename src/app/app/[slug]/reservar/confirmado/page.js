import Stripe from 'stripe'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Reserva confirmada · IMPECABLE',
}

export default async function ConfirmadoPage({ searchParams }) {
  const { session_id, tipo } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isCliente = !!user

  // ── Pago en local ─────────────────────────────────────────
  if (tipo === 'local') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={56} strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h1>
          <p className="text-gray-500 mb-6">
            Te esperamos el día y hora elegidos. El pago se realizará en el local al finalizar el servicio.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-700 text-left">
            Aceptamos efectivo y Bizum.
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Si tienes alguna duda, contáctanos en{' '}
            <a href="mailto:info@laimpecable.es" className="text-blue-600 hover:underline">
              info@laimpecable.es
            </a>
          </p>
          <Link
            href={isCliente ? '/cliente' : '/'}
            className="inline-block bg-dorado text-fondo px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-dorado-dim transition-colors"
          >
            {isCliente ? 'Ver mi portal' : 'Volver al inicio'}
          </Link>
        </div>
      </main>
    )
  }

  // ── Pago online (Stripe) ───────────────────────────────────
  if (!session_id) redirect('/reservar')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch {
    redirect('/reservar')
  }

  if (session.payment_status !== 'paid') redirect('/reservar')

  const lineItem = session.amount_total ? (session.amount_total / 100).toFixed(2) : null

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={56} strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h1>
        <p className="text-gray-500 mb-6">
          Tu pago se ha procesado correctamente. Te esperamos el día y hora elegidos.
        </p>
        {lineItem && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total pagado</span>
              <span className="font-semibold text-gray-900">{lineItem}€</span>
            </div>
          </div>
        )}
        <p className="text-sm text-gray-400 mb-6">
          Si tienes alguna duda, contáctanos en{' '}
          <a href="mailto:info@laimpecable.es" className="text-blue-600 hover:underline">
            info@laimpecable.es
          </a>
        </p>
        <Link
          href={isCliente ? '/cliente' : '/'}
          className="inline-block bg-dorado text-fondo px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-dorado-dim transition-colors"
        >
          {isCliente ? 'Ver mi portal' : 'Volver al inicio'}
        </Link>
      </div>
    </main>
  )
}
