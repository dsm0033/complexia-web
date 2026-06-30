import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const { slug } = await params
  return {
    title: `Servicios — ${slug}`,
  }
}

export default async function ServiciosPage({ params }) {
  const { slug } = await params

  // Service role: ruta pública sin sesión de usuario.
  // Las policies de RLS para anon en services dependen de get_my_business_id()
  // que devuelve NULL sin sesión → usamos service role para evitar ese bloqueo.
  // TODO (migración completa): añadir policy anon en services y usar SSR client.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Resolver tenant por slug — nunca LIMIT 1
  const { data: business } = await admin
    .from('businesses')
    .select('id, name')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!business) notFound()

  const [{ data: servicios }, { data: settings }] = await Promise.all([
    admin
      .from('services')
      .select('id, name, description, price, duration_minutes, active, highlight')
      .eq('business_id', business.id)
      .order('sort_order'),
    admin
      .from('business_settings')
      .select('advance_payment_discount, cash_payment_discount')
      .eq('business_id', business.id)
      .single(),
  ])

  const advanceDiscount = settings?.advance_payment_discount ?? 0
  const cashDiscount    = settings?.cash_payment_discount    ?? 0

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 760, margin: '0 auto', padding: '2rem' }}>
      <Link href={`/app/${slug}`} style={{ fontSize: 13, color: '#666' }}>
        ← {business.name}
      </Link>

      <h1 style={{ marginTop: '1rem', marginBottom: '0.25rem' }}>
        {business.name}
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: 14 }}>
        Tenant: <code>{slug}</code> · Business ID: <code>{business.id}</code>
      </p>

      {servicios?.length === 0 && (
        <p style={{ color: '#999' }}>Este negocio no tiene servicios todavía.</p>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {servicios?.map((s) => (
          <div
            key={s.id}
            style={{
              border: s.highlight ? '2px solid #c9a84c' : '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '1.25rem 1.5rem',
              opacity: s.active ? 1 : 0.5,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                {s.highlight && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#c9a84c', color: '#fff', padding: '2px 8px', borderRadius: 99, letterSpacing: 1, marginBottom: 8, display: 'inline-block' }}>
                    MÁS POPULAR
                  </span>
                )}
                {!s.active && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#e5e7eb', color: '#666', padding: '2px 8px', borderRadius: 99, letterSpacing: 1, marginBottom: 8, display: 'inline-block' }}>
                    PRÓXIMAMENTE
                  </span>
                )}
                <h2 style={{ margin: '4px 0 4px', fontSize: 18 }}>{s.name}</h2>
                <p style={{ color: '#666', fontSize: 14, margin: '0 0 8px', maxWidth: 480 }}>
                  {s.description}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {advanceDiscount > 0 && s.active && (
                    <span style={{ fontSize: 11, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 99 }}>
                      -{advanceDiscount}% pago online
                    </span>
                  )}
                  {cashDiscount > 0 && s.active && (
                    <span style={{ fontSize: 11, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 99 }}>
                      -{cashDiscount}% efectivo
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#c9a84c' }}>
                  {s.price}€
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>{s.duration_minutes} min</div>
                {s.active && (
                  <Link
                    href={`/app/${slug}/reservar?servicio=${s.id}`}
                    style={{ display: 'inline-block', marginTop: 10, padding: '8px 18px', background: '#c9a84c', color: '#fff', borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Reservar →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '2rem', fontSize: 12, color: '#aaa' }}>
        ✅ Slice multi-tenant OK — datos cargados para tenant <strong>{slug}</strong>
      </p>
    </main>
  )
}
