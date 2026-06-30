import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAvailableSlots } from '@/lib/availability'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const serviceId = searchParams.get('service') || null

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ slots: [] })
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Resolver tenant por slug — el formulario de reserva lo pasa como ?slug=xxx
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ slots: [] })

  const { data: business } = await db
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  const businessId = business?.id
  if (!businessId) return NextResponse.json({ slots: [] })

  // Obtener aviso mínimo configurado
  const { data: settings } = await db
    .from('business_settings')
    .select('min_booking_notice_hours')
    .eq('business_id', businessId)
    .single()

  const noticeHours = settings?.min_booking_notice_hours ?? 24

  // Fecha/hora límite: ahora + aviso mínimo
  const cutoff = new Date(Date.now() + noticeHours * 60 * 60 * 1000)
  const cutoffDate = cutoff.toISOString().split('T')[0]

  // Si la fecha pedida es anterior al corte, no hay slots
  if (date < cutoffDate) return NextResponse.json({ slots: [] })

  const result = await getAvailableSlots(date, businessId, serviceId)

  // Si la fecha es el mismo día del corte, filtrar horas anteriores al corte
  if (date === cutoffDate) {
    const cutoffTime = cutoff.toTimeString().slice(0, 5) // "HH:MM"
    result.slots = (result.slots ?? []).filter(slot => slot >= cutoffTime)
    if (!result.slots.length) return NextResponse.json({ slots: [], closed: false, blocked: false })
  }

  return NextResponse.json(result)
}
