import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import FAQSection from '@/components/FAQSection'
import { ArrowRight, Droplets, Armchair, Sparkles, Gem, Lightbulb, Wind, Wrench, Car, Shield, Star, Brush, Zap, Settings } from 'lucide-react'

const ICONS = { Droplets, Armchair, Sparkles, Gem, Lightbulb, Wind, Wrench, Car, Shield, Star, Brush, Zap, Settings }

function ServiceIcon({ name }) {
  const Icon = ICONS[name] ?? Wrench
  return <Icon size={28} color="#C9A84C" strokeWidth={1.5} />
}

const WA_NUMBER = '34607445305'

function waLink(serviceName) {
  const text = encodeURIComponent(`Hola, quiero reservar el servicio de ${serviceName}.`)
  return `https://wa.me/${WA_NUMBER}?text=${text}`
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  return {
    title: `Servicios | ${business?.name ?? 'Servicios'}`,
    description:
      'Todos nuestros servicios con precio y tiempo estimado. Reserva online o por WhatsApp.',
  }
}

export default async function ServiciosPage({ params }) {
  const { slug } = await params
  const base = `/app/${slug}`

  const supabase = await createClient()

  // Resolver tenant por slug — nunca LIMIT 1
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!business) notFound()

  // Service role solo para business_settings (sin policy anon todavía).
  // TODO (M2 auditoría 01/07): añadir policy anon y usar el cliente SSR.
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const [{ data: servicios }, { data: settings }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, price, duration_minutes, active, icon, highlight')
      .eq('business_id', business.id)
      .order('sort_order'),
    adminSupabase
      .from('business_settings')
      .select('advance_payment_discount, cash_payment_discount')
      .eq('business_id', business.id)
      .single(),
  ])

  const advanceDiscount = settings?.advance_payment_discount ?? 0
  const cashDiscount    = settings?.cash_payment_discount    ?? 0

  return (
    <div className="min-h-screen bg-fondo">

      {/* Cabecera */}
      <div className="relative pt-20 pb-16 text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(var(--hsl-dorado) / 0.12) 0%, transparent 65%)" }}
        />
        <div className="relative z-10">
          <Link
            href={base}
            className="inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-[3px] uppercase text-dorado mb-8 hover:text-dorado-dim transition-colors"
          >
            ← Volver
          </Link>
          <h1
            className="font-serif font-black text-texto leading-none mb-4"
            style={{ fontSize: "clamp(36px, 7vw, 64px)" }}
          >
            {business.name}
          </h1>
          <div className="w-[60px] h-[2px] bg-dorado mx-auto my-5" />
          <p
            className="font-sans font-light text-muted max-w-[500px] mx-auto"
            style={{ fontSize: "clamp(15px, 2vw, 18px)" }}
          >
            Todos nuestros tratamientos, con precio y tiempo estimado.
            <br />
            Reserva online o directamente por WhatsApp.
          </p>
        </div>
      </div>

      {/* Listado de servicios */}
      <div className="max-w-[820px] mx-auto px-6 pb-24 space-y-5">
        {servicios?.length === 0 && (
          <p className="text-center font-sans text-muted">
            Este negocio no tiene servicios publicados todavía.
          </p>
        )}

        {servicios?.map((service) => (
          <div
            key={service.id}
            className={`rounded-2xl border p-7 ${
              !service.active
                ? "bg-tarjeta-osc border-borde opacity-70"
                : service.highlight
                ? "bg-gradient-to-br from-tarjeta to-dorado/12 border-dorado"
                : "bg-tarjeta border-borde"
            }`}
          >
            {!service.active && (
              <span className="inline-block bg-borde text-sutil text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans mb-4">
                Próximamente
              </span>
            )}
            {service.active && service.highlight && (
              <span className="inline-block bg-dorado text-fondo text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans mb-4">
                Más popular
              </span>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <ServiceIcon name={service.icon} />
                  <h2 className="font-serif text-[22px] font-bold text-texto">
                    {service.name}
                  </h2>
                </div>
                {service.active && (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="font-sans text-base text-muted">desde</span>
                      <span className="font-serif text-[36px] font-black text-dorado leading-none">
                        {service.price}€
                      </span>
                      <span className="font-sans text-sm text-muted">
                        · {service.duration_minutes} min
                      </span>
                    </div>
                    {(advanceDiscount > 0 || cashDiscount > 0) && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {advanceDiscount > 0 && (
                          <span className="inline-flex items-center font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-400/8 text-green-400 border border-green-400/20">
                            -{advanceDiscount}% online
                          </span>
                        )}
                        {cashDiscount > 0 && (
                          <span className="inline-flex items-center font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-400/8 text-green-400 border border-green-400/20">
                            -{cashDiscount}% efectivo
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
                <p className="font-sans text-sm leading-relaxed text-muted max-w-[480px]">
                  {service.description}
                </p>
              </div>

              <div className="sm:pt-1 sm:shrink-0 flex flex-col gap-2">
                {service.active ? (
                  <>
                    <Link
                      href={`${base}/reservar?servicio=${service.id}`}
                      className="inline-flex items-center gap-2 font-sans text-sm font-semibold px-6 py-3 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors whitespace-nowrap"
                    >
                      Reservar
                      <ArrowRight size={14} />
                    </Link>
                    <a
                      href={waLink(service.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 font-sans text-sm font-semibold px-6 py-3 border border-dorado text-dorado rounded-full tracking-wide hover:bg-dorado/10 transition-colors whitespace-nowrap"
                    >
                      WhatsApp
                    </a>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold px-6 py-3 bg-borde text-sutil rounded-full tracking-wide whitespace-nowrap cursor-not-allowed">
                    No disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <div
        className="text-center px-6 py-16 border-t border-borde"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--hsl-dorado) / 0.15))" }}
      >
        <h2
          className="font-serif font-black text-texto mb-4"
          style={{ fontSize: "clamp(24px, 5vw, 36px)" }}
        >
          ¿Tienes alguna duda?
        </h2>
        <p className="font-sans text-[15px] text-muted mb-8">
          Escríbenos sin compromiso y te respondemos en menos de 24 horas.
        </p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, tengo una pregunta sobre vuestros servicios.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-sans text-[15px] font-semibold px-10 py-4 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
        >
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  )
}
