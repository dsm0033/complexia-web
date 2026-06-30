import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ChecklistInteractivo from './_components/ChecklistInteractivo'

export const metadata = { title: 'Checklist · IMPECABLE' }

export default async function TrabajoPage({ params }) {
  const { slug, id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('email', user.email)
    .single()

  if (!employee) redirect(`/app/${slug}/empleado`)

  const { data: record } = await supabase
    .from('service_records')
    .select(`
      id, date, status, notes, checklist_progress, started_at,
      services(id, name, duration_minutes, checklists(id, name, items)),
      customers(full_name)
    `)
    .eq('id', id)
    .eq('employee_id', employee.id)
    .single()

  if (!record) notFound()

  const checklist = record.services?.checklists
  const items = checklist?.items ?? []

  return (
    <main className="min-h-screen bg-fondo text-texto">
      <header className="bg-tarjeta border-b border-borde px-4 py-4 flex items-center gap-3">
        <Link href={`/app/${slug}/empleado`} className="text-muted hover:text-texto transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="font-semibold">{record.services?.name ?? 'Servicio'}</p>
          <p className="text-sm text-muted">{record.customers?.full_name ?? 'Sin cliente'}</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="bg-tarjeta rounded-xl border border-borde p-10 text-center">
            <p className="text-muted">Este servicio no tiene checklist asignado.</p>
            <Link href={`/app/${slug}/empleado`} className="text-sm text-dorado hover:underline mt-3 inline-block">
              Volver a mis trabajos
            </Link>
          </div>
        ) : (
          <ChecklistInteractivo
            recordId={record.id}
            items={items}
            initialProgress={record.checklist_progress ?? []}
            duration={record.services?.duration_minutes ?? 60}
            status={record.status}
            startedAt={record.started_at ?? null}
            slug={slug}
          />
        )}
      </div>
    </main>
  )
}
