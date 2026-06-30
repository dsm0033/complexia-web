import { notFound } from 'next/navigation'
import { getAdminPageCtx } from '@/lib/admin-context'
import { ServicioForm } from '../../_components/ServicioForm'
import { editarServicio } from '@/app/actions/services'

export const metadata = { title: 'Editar servicio · Admin IMPECABLE' }

export default async function EditarServicioPage({ params }) {
  const { id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const [{ data: servicio }, { data: checklists }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, price, vehicle_pricing, duration_minutes, icon, highlight, checklist_id')
      .eq('id', id)
      .eq('business_id', businessId)
      .single(),
    supabase
      .from('checklists')
      .select('id, name')
      .eq('business_id', businessId)
      .eq('active', true)
      .order('name'),
  ])

  if (!servicio) notFound()

  const action = editarServicio.bind(null, id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar servicio</h1>
        <p className="text-gray-500 mt-1">{servicio.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ServicioForm action={action} initialData={servicio} checklists={checklists ?? []} submitLabel="Guardar cambios" />
      </div>
    </div>
  )
}
