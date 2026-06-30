import { getAdminPageCtx } from '@/lib/admin-context'
import { ServicioForm } from '../_components/ServicioForm'
import { crearServicio } from '@/app/actions/services'

export const metadata = { title: 'Nuevo servicio · Admin IMPECABLE' }

export default async function NuevoServicioPage({ params }) {
  const { slug } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: checklists } = await supabase
    .from('checklists')
    .select('id, name')
    .eq('business_id', businessId)
    .eq('active', true)
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo servicio</h1>
        <p className="text-gray-500 mt-1">Añade un servicio a tu catálogo</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ServicioForm action={crearServicio} checklists={checklists ?? []} submitLabel="Crear servicio" slug={slug} />
      </div>
    </div>
  )
}
