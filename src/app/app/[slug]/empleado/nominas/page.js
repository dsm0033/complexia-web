import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Download } from 'lucide-react'

export const metadata = { title: 'Mis nóminas · IMPECABLE' }

function mesesDesde(startDate) {
  const meses = []
  const inicio = new Date(startDate)
  const hoy = new Date()
  // El mes actual no se muestra hasta que termina
  const limite = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  let cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  while (cur < limite) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    meses.push(`${y}-${m}`)
    cur.setMonth(cur.getMonth() + 1)
  }

  return meses.reverse() // más reciente primero
}

function formatMonth(mes) {
  const [y, m] = mes.split('-')
  return new Date(+y, +m - 1, 1)
    .toLocaleString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

export default async function MisNominasPage({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employee } = await supabase
    .from('employees')
    .select('id, full_name')
    .eq('email', user.email)
    .single()

  if (!employee) redirect(`/app/${slug}/empleado`)

  const { data: contrato } = await supabase
    .from('employee_contracts')
    .select('start_date')
    .eq('employee_id', employee.id)
    .eq('active', true)
    .maybeSingle()

  const meses = contrato?.start_date ? mesesDesde(contrato.start_date) : []

  return (
    <main className="min-h-screen bg-fondo text-texto">
      <header className="bg-tarjeta border-b border-borde px-4 py-4 flex items-center gap-3">
        <Link href={`/app/${slug}/empleado`} className="text-muted hover:text-texto transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs text-dorado font-medium uppercase tracking-wider">IMPECABLE</p>
          <h1 className="font-bold text-lg">Mis nóminas</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {meses.length === 0 ? (
          <div className="bg-tarjeta rounded-xl border border-borde p-12 text-center">
            <FileText size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted">No hay nóminas disponibles todavía.</p>
            <p className="text-xs text-muted/50 mt-1">Estarán disponibles desde el mes siguiente al inicio de tu contrato.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meses.map(mes => (
              <div
                key={mes}
                className="bg-tarjeta rounded-xl border border-borde px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-dorado shrink-0" />
                  <p className="font-semibold text-texto">{formatMonth(mes)}</p>
                </div>
                <a
                  href={`/api/nominas/download?employee_id=${employee.id}&mes=${mes}`}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-dorado border border-dorado/40 rounded-lg hover:bg-dorado/10 transition-colors"
                >
                  <Download size={13} />
                  Descargar PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
