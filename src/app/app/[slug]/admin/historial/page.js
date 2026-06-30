import { Suspense } from 'react'
import Link from 'next/link'
import { getAdminPageCtx } from '@/lib/admin-context'
import { HistorialTable } from './_components/HistorialTable'

export const metadata = { title: 'Historial · Admin IMPECABLE' }

export default async function HistorialPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: registros } = await supabase
    .from('service_records')
    .select(`
      id, date, price, status, notes, is_paid, is_collected, payment_method, started_at, completed_at,
      customers(full_name),
      services(name),
      employees(full_name),
      invoices(id)
    `)
    .eq('business_id', businessId)
    .order('date', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de servicios</h1>
          <p className="text-gray-500 mt-1">{registros?.length ?? 0} registros</p>
        </div>
        <Link
          href="/admin/historial/nuevo"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Registrar servicio
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando...</div>}>
          <HistorialTable registros={registros ?? []} />
        </Suspense>
      </div>
    </div>
  )
}
