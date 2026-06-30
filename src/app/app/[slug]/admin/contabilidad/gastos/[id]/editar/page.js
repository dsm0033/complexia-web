import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getAdminPageCtx } from '@/lib/admin-context'
import { GastoForm } from '../../_components/GastoForm'
import { actualizarGasto } from '../../actions'

export const metadata = { title: 'Editar gasto · Admin IMPECABLE' }

export default async function EditarGastoPage({ params }) {
  const { slug, id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: gasto } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (!gasto) notFound()

  const action = actualizarGasto.bind(null, id)

  return (
    <div>
      <Link
        href={`/app/${slug}/admin/contabilidad/gastos`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} />
        Volver a Gastos
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar gasto</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <GastoForm action={action} initialData={gasto} submitLabel="Guardar cambios" cancelHref={`/app/${slug}/admin/contabilidad/gastos`} />
      </div>
    </div>
  )
}
