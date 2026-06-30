import { notFound } from 'next/navigation'
import { getAdminPageCtx } from '@/lib/admin-context'
import GestionForm from './_components/GestionForm'
import EntitlementForm from './_components/EntitlementForm'
import ManualRequestForm from './_components/ManualRequestForm'
import { aprobarSolicitud, rechazarSolicitud, actualizarEntitlement, crearSolicitudManual } from './actions'

export const metadata = { title: 'Vacaciones · Admin IMPECABLE' }

export default async function VacacionesAdminPage({ params }) {
  const { id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const year = new Date().getFullYear()

  const [{ data: empleado }, { data: requests }, { data: entitlement }, { data: settings }] = await Promise.all([
    supabase.from('employees').select('id, full_name')
      .eq('id', id).eq('business_id', businessId).single(),
    supabase.from('vacation_requests').select('id, start_date, end_date, working_days, status, admin_notes, created_at')
      .eq('employee_id', id).order('created_at', { ascending: false }),
    supabase.from('vacation_entitlements').select('total_days, carryover_days')
      .eq('employee_id', id).eq('year', year).maybeSingle(),
    supabase.from('business_settings').select('max_concurrent_vacations')
      .eq('business_id', businessId).maybeSingle(),
  ])

  if (!empleado) notFound()

  const maxConcurrent = settings?.max_concurrent_vacations ?? 1

  // Detectar solicitudes pendientes con posible conflicto de solapamiento
  const approvedRequests = (requests ?? []).filter(r => r.status === 'aprobada')
  const enrichedRequests = (requests ?? []).map(r => {
    if (r.status !== 'pendiente') return { ...r, conflict: false }
    const overlap = approvedRequests.filter(a =>
      a.start_date <= r.end_date && a.end_date >= r.start_date
    )
    return { ...r, conflict: overlap.length >= maxConcurrent }
  })

  const usedDays      = approvedRequests.filter(r => new Date(r.start_date).getFullYear() === year)
                          .reduce((s, r) => s + r.working_days, 0)
  const totalDays     = (entitlement?.total_days ?? 22) + (entitlement?.carryover_days ?? 0)
  const remainingDays = totalDays - usedDays

  const aprobarActions    = enrichedRequests.map(r => aprobarSolicitud.bind(null, r.id))
  const rechazarActions   = enrichedRequests.map(r => rechazarSolicitud.bind(null, r.id))
  const entitlementAction = actualizarEntitlement.bind(null, id)
  const manualAction      = crearSolicitudManual.bind(null, id)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <a href="/admin/empleados" className="hover:text-gray-700">Empleados</a>
          <span>/</span>
          <a href={`/admin/empleados/${id}/editar`} className="hover:text-gray-700">{empleado.full_name}</a>
          <span>/</span>
          <span>Vacaciones</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={`/admin/empleados/${id}/editar`}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            ← Volver
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vacaciones</h1>
            <p className="text-gray-500 mt-1">{empleado.full_name}</p>
          </div>
        </div>
      </div>

      {/* Resumen días */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: `Total ${year}`, value: totalDays },
          { label: 'Disfrutados',   value: usedDays },
          { label: 'Restantes',     value: remainingDays },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Configurar días */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Días asignados {year}</h2>
        <EntitlementForm action={entitlementAction} entitlement={entitlement} year={year} />
      </div>

      {/* Solicitudes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Solicitudes</h2>
        <GestionForm
          requests={enrichedRequests}
          aprobarActions={aprobarActions}
          rechazarActions={rechazarActions}
        />
      </div>

      {/* Crear vacaciones manualmente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Crear vacaciones manualmente</h2>
        <p className="text-sm text-gray-500 mb-4">
          Omite la restricción de antelación. Se aprueba directamente. Útil para acuerdos urgentes o excepciones.
        </p>
        <ManualRequestForm action={manualAction} />
      </div>
    </div>
  )
}
