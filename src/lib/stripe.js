import Stripe from 'stripe'

// Singleton del cliente Stripe — evita crear uno nuevo en cada request.
let _client

function getClient() {
  if (!_client) {
    _client = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return _client
}

/**
 * Crea una Stripe Checkout Session para un pago único en euros.
 *
 * Parámetros:
 *   serviceName    — nombre del producto (visible en el checkout)
 *   description    — texto auxiliar bajo el nombre
 *   amountCents    — importe en céntimos (Math.round(precio * 100))
 *   customerEmail  — opcional, precarga el email en el formulario de Stripe
 *   successUrl     — URL absoluta tras pago OK. Puede llevar {CHECKOUT_SESSION_ID}
 *   cancelUrl      — URL absoluta si el usuario cancela
 *   metadata       — objeto plano que se propaga al webhook (ej. booking_id)
 */
export async function crearCheckoutSession({
  serviceName,
  description,
  amountCents,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata,
}) {
  return getClient().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    // La sesión caduca a los 30 min (mínimo que permite Stripe). Sin esto el
    // default son 24h: una reserva 'pendiente' sin pagar retendría el slot un
    // día entero impidiendo que otros clientes lo reserven. Al expirar, Stripe
    // emite checkout.session.expired y el webhook marca la reserva 'cancelado',
    // liberando el slot. La ventana coincide con PENDIENTE_ABANDONO_MS.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: serviceName, description },
        unit_amount: amountCents,
      },
      quantity: 1,
    }],
    customer_email: customerEmail ?? undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  })
}

/**
 * Valida la firma de un webhook de Stripe contra STRIPE_WEBHOOK_SECRET y
 * devuelve el evento. Lanza si la firma no coincide — quien lo llama debe
 * envolverlo en try/catch y responder 400 al cliente.
 */
export function verifyWebhookSignature(body, signature) {
  return getClient().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  )
}
