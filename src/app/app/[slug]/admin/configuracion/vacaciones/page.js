import { getAdminPageCtx } from '@/lib/admin-context'
import SolicitudesPendientes from './_components/SolicitudesPendientes'
import AddBlackoutForm from './_components/AddBlackoutForm'
import ConfigVacacionesForm from './_components/ConfigVacacionesForm'
import {
  guardarConfigVacaciones,
  añadirBlackout,
  eliminarBlackout,
  aprobarSolicitudConfig,
  rechazarSolicitudConfig,
} from './actions'

export const metadata = { title: 'Configuración de vacaciones · Admin IMPECABLE' }

const fmt = d => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function ConfigVacacionesPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const [{ data: pending }, { data: blackouts }, { data: settings }] = await Promise.all([
    supabase
      .from('vacation_requests')
      .select('id, start_date, end_date, working_days, status, admin_notes, created_at, employees(full_name)')
      .eq('business_id', businessId)
      .eq('status', 'pendiente')
      .order('start_date'),
    supabase
      .from('vacation_blackouts')
      .select('id, start_date, end_date, reason')
      .eq('business_id', businessId)
      .order('start_date'),
    supabase
      .from('business_settings')
      .select('max_concurrent_vacations, min_vacation_notice_days')
      .eq('business_id', businessId)
      .maybeSingle(),
  ])

  const maxConcurrent = settings?.max_concurrent_vacations ?? 1
  const noticeDays    = settings?.min_vacation_notice_days ?? 30

  // Detectar solapamiento: ¿hay ya maxConcurrent aprobadas en las fechas de cada pendiente?
  const { data: approved } = await supabase
    .from('vacation_requests')
    .select('start_date, end_date')
    .eq('business_id', businessId)
    .eq('status', 'aprobada')

  const enriched = (pending ?? []).map(r => {
    const overlap = (approved ?? []).filter(a =>
      a.start_date <= r.end_date && a.end_date >= r.start_date
    )
    return { ...r, conflict: overlap.length >= maxConcurrent }
  })

  const aprobarActions  = enriched.map(r => aprobarSolicitudConfig.bind(null, r.id))
  const rechazarActions = enriched.map(r => rechazarSolicitudConfig.bind(null, r.id))

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vacaciones</h1>
        <p className="text-sm text-gray-500 mt-1">Solicitudes pendientes, períodos bloqueados y configuración.</p>
      </div>

      {/* Solicitudes pendientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Solicitudes pendientes</h2>
          {enriched.length > 0 && (
            <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full">
              {enriched.length}
            </span>
          )}
        </div>
        <SolicitudesPendientes
          requests={enriched}
          aprobarActions={aprobarActions}
          rechazarActions={rechazarActions}
        />
      </div>

      {/* Configuración */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuración</h2>
        <ConfigVacacionesForm action={guardarConfigVacaciones} maxConcurrent={maxConcurrent} noticeDays={noticeDays} />
      </div>

      {/* Períodos bloqueados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-base font-semibold text-gray-900">Períodos bloqueados</h2>
        <p className="text-sm text-gray-500 -mt-4">
          Los empleados no podrán solicitar vacaciones en estas fechas.
        </p>

        {/* Lista */}
        {!blackouts?.length ? (
          <p className="text-sm text-gray-400">No hay períodos bloqueados.</p>
        ) : (
          <div className="space-y-2">
            {blackouts.map(b => {
              const deleteAction = eliminarBlackout.bind(null, b.id)
              return (
                <div key={b.id} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.reason}</p>
                    <p className="text-xs text-gray-500">{fmt(b.start_date)} – {fmt(b.end_date)}</p>
                  </div>
                  <form action={deleteAction}>
                    <button
                      type="submit"
                      className="text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}

        {/* Añadir */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Añadir período bloqueado</h3>
          <AddBlackoutForm action={añadirBlackout} />
        </div>
      </div>
    </div>
  )
}
