import { getAdminPageCtx } from '@/lib/admin-context'
import { cargarVacacionesPorEmpleado } from '@/lib/vacaciones'
import { RegistroForm } from '../_components/RegistroForm'
import { crearRegistro } from '../actions'

export const metadata = { title: 'Registrar servicio · Admin IMPECABLE' }

export default async function NuevoRegistroPage({ params }) {
  const { slug } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const [{ data: clientes }, { data: servicios }, { data: empleados }, vacacionesPorEmpleado] = await Promise.all([
    supabase.from('customers').select('id, full_name').eq('business_id', businessId).order('full_name'),
    supabase.from('services').select('id, name, price').eq('business_id', businessId).eq('active', true).order('sort_order'),
    supabase.from('employees').select('id, full_name').eq('business_id', businessId).eq('active', true).order('full_name'),
    cargarVacacionesPorEmpleado(supabase, businessId),
  ])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Registrar servicio</h1>
        <p className="text-gray-500 mt-1">Añade un servicio realizado al historial</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <RegistroForm
          action={crearRegistro}
          clientes={clientes ?? []}
          servicios={servicios ?? []}
          empleados={empleados ?? []}
          vacacionesPorEmpleado={vacacionesPorEmpleado}
          initialData={{ date: today }}
          submitLabel="Registrar servicio"
          slug={slug}
        />
      </div>
    </div>
  )
}
