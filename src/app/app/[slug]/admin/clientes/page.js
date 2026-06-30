import Link from 'next/link'
import { getAdminPageCtx } from '@/lib/admin-context'
import { ClientesTable } from './_components/ClientesTable'

export const metadata = { title: 'Clientes · Admin IMPECABLE' }

export default async function ClientesPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: raw } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, created_at, bookings_count:bookings(count)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  // Supabase devuelve el count como [{count: N}] — lo aplanamos a número
  const clientes = raw?.map(c => ({
    ...c,
    bookings_count: c.bookings_count?.[0]?.count ?? 0,
  })) ?? []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">{clientes.length} clientes registrados</p>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {!clientes.length ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg font-medium">Sin clientes todavía</p>
            <p className="text-sm mt-1">Pulsa "Nuevo cliente" para añadir el primero</p>
          </div>
        ) : (
          <ClientesTable clientes={clientes} />
        )}
      </div>
    </div>
  )
}
