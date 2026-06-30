import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Palmtree, CalendarX } from 'lucide-react'
import SolicitudForm from './_components/SolicitudForm'
import { solicitarVacaciones, cancelarSolicitud } from './actions'

export const metadata = { title: 'Mis vacaciones · IMPECABLE' }

const STATUS_LABEL = { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada', cancelada: 'Cancelada' }
const STATUS_COLOR = {
  pendiente:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  aprobada:   'bg-green-500/10  text-green-400  border-green-500/20',
  rechazada:  'bg-red-500/10    text-red-400    border-red-500/20',
  cancelada:  'bg-gray-500/10   text-gray-400   border-gray-500/20',
}

function fmt(date) {
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function VacacionesEmpleadoPage({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employee } = await supabase
    .from('employees')
    .select('id, full_name, business_id')
    .eq('email', user.email)
    .single()

  if (!employee) redirect(`/app/${slug}/empleado`)

  // Marcar como leídas todas las resoluciones no vistas aún
  await supabase
    .from('vacation_requests')
    .update({ employee_read: true })
    .eq('employee_id', employee.id)
    .eq('employee_read', false)

  const year = new Date().getFullYear()

  const [{ data: entitlement }, { data: requests }, { data: blackouts }, { data: settings }] = await Promise.all([
    supabase
      .from('vacation_entitlements')
      .select('total_days, carryover_days')
      .eq('employee_id', employee.id)
      .eq('year', year)
      .maybeSingle(),
    supabase
      .from('vacation_requests')
      .select('id, start_date, end_date, working_days, status, admin_notes, created_at')
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('vacation_blackouts')
      .select('start_date, end_date, reason')
      .eq('business_id', employee.business_id)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date'),
    supabase
      .from('business_settings')
      .select('min_vacation_notice_days')
      .eq('business_id', employee.business_id)
      .maybeSingle(),
  ])

  const noticeDays = settings?.min_vacation_notice_days ?? 30
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + noticeDays)
  const minDateStr = minDate.toISOString().split('T')[0]

  const totalDays  = (entitlement?.total_days ?? 22) + (entitlement?.carryover_days ?? 0)
  const usedDays   = (requests ?? []).filter(r => r.status === 'aprobada' && new Date(r.start_date).getFullYear() === year)
                       .reduce((s, r) => s + r.working_days, 0)
  const pendingDays = (requests ?? []).filter(r => r.status === 'pendiente')
                       .reduce((s, r) => s + r.working_days, 0)
  const remainingDays = totalDays - usedDays

  return (
    <main className="min-h-screen bg-fondo text-texto">
      <header className="bg-tarjeta border-b border-borde px-4 py-4 flex items-center gap-3">
        <Link href={`/app/${slug}/empleado`} className="text-muted hover:text-texto transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs text-dorado font-medium uppercase tracking-wider">IMPECABLE</p>
          <h1 className="font-bold text-lg">Mis vacaciones</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Resumen días */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total año',   value: totalDays,    color: 'text-texto' },
            { label: 'Disfrutados', value: usedDays,     color: 'text-green-400' },
            { label: 'Pendientes',  value: pendingDays,  color: 'text-yellow-400' },
            { label: 'Restantes',   value: remainingDays, color: 'text-dorado' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-tarjeta border border-borde rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Formulario solicitud */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palmtree size={20} color="#C9A84C" />
            <h2 className="font-semibold text-lg">Solicitar vacaciones</h2>
          </div>
          <div className="bg-tarjeta border border-borde rounded-xl p-5 space-y-4">
            <div className="flex gap-2.5 px-3 py-2.5 bg-dorado/10 border border-dorado/20 rounded-lg">
              <span className="text-dorado text-sm shrink-0">ℹ</span>
              <p className="text-xs text-dorado/80 leading-relaxed">
                Las vacaciones deben solicitarse con al menos <strong className="text-dorado">{noticeDays} días de antelación</strong>.
                Según el Art. 38 del Estatuto de los Trabajadores, la empresa debe comunicar
                el calendario vacacional con 2 meses de antelación.
              </p>
            </div>
            <SolicitudForm action={solicitarVacaciones} minDate={minDateStr} noticeDays={noticeDays} />
          </div>
        </section>

        {/* Períodos bloqueados */}
        {blackouts?.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CalendarX size={18} color="#8A9AAC" />
              <h2 className="font-semibold text-sm text-muted">Períodos no disponibles</h2>
            </div>
            <div className="space-y-2">
              {blackouts.map((b, i) => (
                <div key={i} className="bg-tarjeta border border-borde rounded-lg px-4 py-2 flex items-center justify-between text-sm">
                  <span className="text-texto">{b.reason}</span>
                  <span className="text-muted">{fmt(b.start_date)} – {fmt(b.end_date)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Historial de solicitudes */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Mis solicitudes</h2>
          {!requests?.length ? (
            <div className="bg-tarjeta border border-borde rounded-xl p-10 text-center text-muted text-sm">
              No has hecho ninguna solicitud todavía.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => {
                const cancelAction = cancelarSolicitud.bind(null, r.id)
                return (
                  <div key={r.id} className="bg-tarjeta border border-borde rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-texto">
                          {fmt(r.start_date)} → {fmt(r.end_date)}
                        </p>
                        <p className="text-sm text-muted mt-0.5">
                          {r.working_days} {r.working_days === 1 ? 'día hábil' : 'días hábiles'}
                        </p>
                        {r.admin_notes && (
                          <p className="text-xs text-muted mt-1 italic">"{r.admin_notes}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLOR[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                        {r.status === 'pendiente' && (
                          <form action={cancelAction}>
                            <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                              Cancelar
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
