import Link from 'next/link'
import { getAdminPageCtx } from '@/lib/admin-context'
import EmpleadosTable from './_components/EmpleadosTable'

export const metadata = { title: 'Empleados · Admin IMPECABLE' }

export default async function EmpleadosPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const today = new Date().toISOString().split('T')[0]

  const [{ data: empleados }, { data: enTurnoHoy }, { data: conHorario }] = await Promise.all([
    supabase
      .from('employees')
      .select('id, full_name, email, phone, position, active, created_at')
      .eq('business_id', businessId)
      .order('full_name'),
    supabase
      .from('time_entries')
      .select('employee_id')
      .eq('business_id', businessId)
      .eq('date', today)
      .is('clock_out', null),
    supabase
      .from('employee_schedules')
      .select('employee_id')
      .eq('business_id', businessId)
      .is('effective_until', null)
      .gt('contracted_minutes', 0),
  ])

  const enTurnoIds    = (enTurnoHoy ?? []).map(e => e.employee_id)
  const conHorarioIds = (conHorario  ?? []).map(s => s.employee_id)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-500 mt-1">{empleados?.length ?? 0} empleados registrados</p>
        </div>
        <Link
          href="/admin/empleados/nuevo"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo empleado
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {!empleados?.length ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg font-medium">Sin empleados todavía</p>
            <p className="text-sm mt-1">Pulsa "Nuevo empleado" para añadir el primero</p>
          </div>
        ) : (
          <EmpleadosTable
            empleados={empleados}
            enTurnoIds={enTurnoIds}
            conHorarioIds={conHorarioIds}
          />
        )}
      </div>
    </div>
  )
}
