import { notFound } from 'next/navigation'
import { getAdminPageCtx } from '@/lib/admin-context'
import { HorarioForm } from './_components/HorarioForm'
import { guardarHorario } from '../../actions'

export const metadata = { title: 'Horario laboral · Admin IMPECABLE' }

// Días de la semana en convención española (0=lunes)
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default async function HorarioPage({ params }) {
  const { id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const [{ data: empleado }, { data: schedules }] = await Promise.all([
    supabase
      .from('employees')
      .select('id, full_name')
      .eq('id', id)
      .eq('business_id', businessId)
      .single(),
    supabase
      .from('employee_schedules')
      .select('day_of_week, contracted_minutes, effective_from')
      .eq('employee_id', id)
      .is('effective_until', null)
      .order('day_of_week'),
  ])

  if (!empleado) notFound()

  // Construir array de 7 días con los datos actuales (0 si no hay registro)
  const horarioActual = DIAS.map((nombre, i) => {
    const registro = schedules?.find(s => s.day_of_week === i)
    return {
      day_of_week: i,
      nombre,
      contracted_minutes: registro?.contracted_minutes ?? 0,
      effective_from: registro?.effective_from ?? null,
    }
  })

  const action = guardarHorario.bind(null, id)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <a href="/admin/empleados" className="hover:text-gray-700">Empleados</a>
          <span>/</span>
          <a href={`/admin/empleados/${id}/editar`} className="hover:text-gray-700">{empleado.full_name}</a>
          <span>/</span>
          <span>Horario</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/admin/empleados/${id}/editar`}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Volver
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Horario laboral</h1>
            <p className="text-gray-500 mt-1">{empleado.full_name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
        <HorarioForm action={action} horario={horarioActual} />
      </div>
    </div>
  )
}
