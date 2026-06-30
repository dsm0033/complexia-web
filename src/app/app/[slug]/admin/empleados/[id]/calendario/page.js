import { getAdminPageCtx } from '@/lib/admin-context'
import { notFound } from 'next/navigation'
import { cargarCalendarioEmpleado } from '@/lib/calendario-empleado'
import CalendarioEmpleado from '@/components/CalendarioEmpleado'
import MesNav from '@/components/MesNav'

export async function generateMetadata() {
  return { title: 'Calendario del empleado · Admin IMPECABLE' }
}

const mesActual = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function CalendarioEmpleadoAdminPage({ params, searchParams }) {
  const { slug, id } = await params
  const sp = await searchParams
  const mes = /^\d{4}-\d{2}$/.test(sp?.mes ?? '') ? sp.mes : mesActual()

  const { supabase, businessId } = await getAdminPageCtx()

  const { data: empleado } = await supabase
    .from('employees')
    .select('id, full_name, position')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (!empleado) notFound()

  const celdas = await cargarCalendarioEmpleado(supabase, {
    employeeId: id,
    businessId,
    mes,
  })

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <a href={`/app/${slug}/admin/empleados`} className="hover:text-gray-700">Empleados</a>
          <span>/</span>
          <a href={`/app/${slug}/admin/empleados/${id}/editar`} className="hover:text-gray-700">{empleado.full_name}</a>
          <span>/</span>
          <span>Calendario</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
            <p className="text-gray-500 mt-1">
              {empleado.full_name}
              {empleado.position && <span className="text-gray-400"> · {empleado.position}</span>}
            </p>
          </div>
          <MesNav mes={mes} />
        </div>
      </div>

      <CalendarioEmpleado celdas={celdas} />
    </div>
  )
}
