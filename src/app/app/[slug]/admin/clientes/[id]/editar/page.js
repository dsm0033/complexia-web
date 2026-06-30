import { notFound } from 'next/navigation'
import { getAdminPageCtx } from '@/lib/admin-context'
import { ClienteForm } from '../../_components/ClienteForm'
import { editarCliente } from '../../actions'

export const metadata = { title: 'Editar cliente · Admin IMPECABLE' }

export default async function EditarClientePage({ params }) {
  const { slug, id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: cliente } = await supabase
    .from('customers')
    .select('id, full_name, email, phone')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (!cliente) notFound()

  const action = editarCliente.bind(null, id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar cliente</h1>
        <p className="text-gray-500 mt-1">{cliente.full_name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ClienteForm action={action} initialData={cliente} submitLabel="Guardar cambios" slug={slug} />
      </div>
    </div>
  )
}
