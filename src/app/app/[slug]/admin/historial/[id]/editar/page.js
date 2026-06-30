import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminPageCtx } from '@/lib/admin-context'
import { cargarVacacionesPorEmpleado } from '@/lib/vacaciones'
import { RegistroForm } from '../../_components/RegistroForm'
import { editarRegistro } from '../../actions'

export const metadata = { title: 'Editar registro · Admin IMPECABLE' }

export default async function EditarRegistroPage({ params }) {
  const { id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const [{ data: registro }, { data: clientes }, { data: servicios }, { data: empleados }, vacacionesPorEmpleado] =
    await Promise.all([
      supabase.from('service_records').select('*').eq('id', id).eq('business_id', businessId).single(),
      supabase.from('customers').select('id, full_name').eq('business_id', businessId).order('full_name'),
      supabase.from('services').select('id, name, price').eq('business_id', businessId).order('sort_order'),
      supabase.from('employees').select('id, full_name').eq('business_id', businessId).eq('active', true).order('full_name'),
      cargarVacacionesPorEmpleado(supabase, businessId),
    ])

  if (!registro) notFound()

  const action = editarRegistro.bind(null, id)

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/historial" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4">
          <ArrowLeft size={15} />
          Volver al historial
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar registro</h1>
        <p className="text-gray-500 mt-1">{new Date(registro.date).toLocaleDateString('es-ES')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <RegistroForm
          action={action}
          clientes={clientes ?? []}
          servicios={servicios ?? []}
          empleados={empleados ?? []}
          vacacionesPorEmpleado={vacacionesPorEmpleado}
          initialData={registro}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  )
}
