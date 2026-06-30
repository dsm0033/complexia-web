import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import BookingForm from './BookingForm'

export const metadata = {
  title: 'Reservar · IMPECABLE',
}

export default async function ReservarPage({ searchParams }) {
  const { servicio: defaultServicioId } = await searchParams
  const supabase = await createClient()
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: services }, { data: businessId }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, price, duration_minutes, vehicle_pricing')
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    supabase.rpc('get_default_business_id'),
  ])

  // Pre-rellenar datos del cliente si está autenticado
  let customerData = null
  if (user) {
    const { data } = await supabase
      .from('customers')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle()
    customerData = data
  }

  const { data: settings } = businessId
    ? await adminSupabase
        .from('business_settings')
        .select('booking_advance_days, advance_payment_discount, cash_payment_discount, min_booking_notice_hours')
        .eq('business_id', businessId)
        .single()
    : { data: null }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reserva tu servicio</h1>
          <p className="text-gray-500 mt-2">IMPECABLE · Cuidado Profesional del Vehículo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {services?.length > 0 ? (
            <BookingForm
              services={services}
              advanceDays={settings?.booking_advance_days ?? 60}
              discountPct={settings?.advance_payment_discount ?? 0}
              cashDiscountPct={settings?.cash_payment_discount ?? 0}
              noticeHours={settings?.min_booking_notice_hours ?? 24}
              userEmail={user?.email ?? null}
              userName={customerData?.full_name ?? null}
              defaultServiceId={defaultServicioId ?? null}
            />
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay servicios disponibles en este momento.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
