import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, LogOut, Calendar, User, CheckCircle2 } from 'lucide-react'
import BotonFichaje from './_components/BotonFichaje'
import IbanForm from './_components/IbanForm'
import EmpleadoNav from '@/components/EmpleadoNav'

export const metadata = { title: 'Mis trabajos · IMPECABLE' }

export default async function EmpleadoPage({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: employee }, { data: profile }] = await Promise.all([
    supabase.from('employees').select('id, full_name, iban').eq('email', user.email).single(),
    supabase.from('profiles').select('role').eq('id', user.id).single(),
  ])

  if (!employee) {
    return (
      <main className="min-h-screen bg-fondo text-texto flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-6">Tu cuenta no está vinculada a ningún empleado.</p>
          <form action={logout}>
            <button type="submit" className="text-sm text-red-400 hover:underline">Cerrar sesión</button>
          </form>
        </div>
      </main>
    )
  }

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString().split('T')[0]

  const [{ data: pendientes }, { data: completados }, { data: fichajeActivo }, { count: vacacionesNoLeidas }] = await Promise.all([
    supabase
      .from('service_records')
      .select('id, date, checklist_progress, services(name, duration_minutes), customers(full_name)')
      .eq('employee_id', employee.id)
      .eq('status', 'pendiente')
      .order('date', { ascending: true }),
    supabase
      .from('service_records')
      .select('id, date, started_at, completed_at, price, services(name, duration_minutes), customers(full_name)')
      .eq('employee_id', employee.id)
      .eq('status', 'completado')
      .gte('date', firstDayPrevMonth)
      .order('date', { ascending: false }),
    supabase
      .from('time_entries')
      .select('id, clock_in')
      .eq('employee_id', employee.id)
      .eq('date', today)
      .is('clock_out', null)
      .maybeSingle(),
    supabase
      .from('vacation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', employee.id)
      .eq('employee_read', false),
  ])

  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const mesCurso = (completados ?? []).filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
  const mesAnterior = (completados ?? []).filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear
  })

  function calcMinutos(trabajos) {
    return trabajos.reduce((acc, t) => {
      if (t.started_at && t.completed_at) {
        return acc + Math.round((new Date(t.completed_at) - new Date(t.started_at)) / 60000)
      }
      return acc
    }, 0)
  }
  function formatMinutos(min) {
    if (min === 0) return null
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h === 0) return `${m} min`
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  return (
    <main className="min-h-screen bg-fondo text-texto">
      <header className="bg-tarjeta border-b border-borde px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-dorado font-medium uppercase tracking-wider">IMPECABLE</p>
          <h1 className="font-bold text-lg">{employee.full_name}</h1>
        </div>
        <EmpleadoNav slug={slug} vacacionesNoLeidas={vacacionesNoLeidas} esAdmin={profile?.role === 'admin'} />
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

        {/* Fichaje */}
        <BotonFichaje fichajeActivo={fichajeActivo} />

        {/* Trabajos pendientes */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList size={22} color="#C9A84C" />
            <h2 className="text-lg font-semibold">Trabajos pendientes</h2>
            {pendientes?.length > 0 && (
              <span className="bg-dorado text-fondo text-xs font-bold px-2 py-0.5 rounded-full">
                {pendientes.length}
              </span>
            )}
          </div>

          {!pendientes?.length ? (
            <div className="bg-tarjeta rounded-xl border border-borde p-10 text-center">
              <p className="text-muted">No tienes trabajos pendientes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendientes.map((t) => {
                const progress = Array.isArray(t.checklist_progress) ? t.checklist_progress : []
                const enCurso = progress.length > 0
                return (
                  <Link
                    key={t.id}
                    href={`/app/${slug}/empleado/${t.id}`}
                    className="block bg-tarjeta rounded-xl border border-borde p-4 hover:border-dorado transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-texto">{t.services?.name ?? 'Servicio'}</p>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted">
                          <User size={13} />
                          <span className="truncate">{t.customers?.full_name ?? 'Cliente no registrado'}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted">
                          <Calendar size={13} />
                          <span>
                            {new Date(t.date).toLocaleDateString('es-ES', {
                              weekday: 'long', day: 'numeric', month: 'long',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {t.services?.duration_minutes && (
                          <p className="text-sm text-muted">{t.services.duration_minutes} min</p>
                        )}
                        {enCurso && (
                          <p className="text-xs text-dorado mt-1 font-medium">En curso</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Historial de trabajos completados */}
        {(mesCurso.length > 0 || mesAnterior.length > 0) && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} color="#22c55e" />
              <h2 className="text-lg font-semibold">Historial de trabajos</h2>
            </div>

            {[
              {
                label: now.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()),
                trabajos: mesCurso,
              },
              {
                label: new Date(prevYear, prevMonth, 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()),
                trabajos: mesAnterior,
              },
            ].map(({ label, trabajos }) => {
              if (trabajos.length === 0) return null
              const mins = calcMinutos(trabajos)
              const tiempoStr = formatMinutos(mins)
              return (
                <div key={label}>
                  {/* Resumen del mes */}
                  <div className="bg-tarjeta border border-borde rounded-xl px-4 py-3 mb-2 flex items-center justify-between">
                    <p className="font-semibold text-dorado">{label}</p>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>{trabajos.length} {trabajos.length === 1 ? 'trabajo' : 'trabajos'}</span>
                      {tiempoStr && <span>{tiempoStr}</span>}
                    </div>
                  </div>

                  {/* Lista de trabajos del mes */}
                  <div className="space-y-2">
                    {trabajos.map((t) => {
                      const durMin = t.started_at && t.completed_at
                        ? Math.round((new Date(t.completed_at) - new Date(t.started_at)) / 60000)
                        : (t.services?.duration_minutes ?? null)
                      return (
                        <div
                          key={t.id}
                          className="bg-tarjeta rounded-xl border border-borde px-4 py-3 flex items-center justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-texto">{t.services?.name ?? 'Servicio'}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                              <User size={11} />
                              <span className="truncate">{t.customers?.full_name ?? '—'}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 text-xs text-muted space-y-0.5">
                            <p>
                              {new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </p>
                            {durMin !== null && <p>{formatMinutos(durMin)}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* Datos bancarios */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            <h2 className="text-lg font-semibold">Datos bancarios</h2>
          </div>
          <div className="bg-tarjeta rounded-xl border border-borde p-5">
            <IbanForm ibanActual={employee.iban} />
          </div>
        </section>

      </div>
    </main>
  )
}
