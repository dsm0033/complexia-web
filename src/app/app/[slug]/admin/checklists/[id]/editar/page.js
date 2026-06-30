import { notFound } from 'next/navigation'
import { getAdminPageCtx } from '@/lib/admin-context'
import { ChecklistForm } from '../../_components/ChecklistForm'
import { editarChecklist } from '../../actions'

export const metadata = { title: 'Editar checklist · Admin IMPECABLE' }

export default async function EditarChecklistPage({ params }) {
  const { slug, id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: checklist } = await supabase
    .from('checklists')
    .select('id, name, items')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (!checklist) notFound()

  const action = editarChecklist.bind(null, id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar checklist</h1>
        <p className="text-gray-500 mt-1">{checklist.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ChecklistForm action={action} initialData={checklist} submitLabel="Guardar cambios" slug={slug} />
      </div>
    </div>
  )
}
