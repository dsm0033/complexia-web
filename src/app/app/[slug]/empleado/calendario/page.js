import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cargarCalendarioEmpleado } from '@/lib/calendario-empleado'
import CalendarioEmpleado from '@/components/CalendarioEmpleado'
import MesNav from '@/components/MesNav'

export const metadata = { title: 'Mi calendario · IMPECABLE' }

const mesActual = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function EmpleadoCalendarioPage({ params: routeParams, searchParams }) {
  const { slug } = await routeParams
  const sp = await searchParams
  const mes = /^\d{4}-\d{2}$/.test(sp?.mes ?? '') ? sp.mes : mesActual()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employee } = await supabase
    .from('employees')
    .select('id, business_id, full_name')
    .eq('email', user.email)
    .single()

  if (!employee) redirect(`/app/${slug}/empleado`)

  const celdas = await cargarCalendarioEmpleado(supabase, {
    employeeId: employee.id,
    businessId: employee.business_id,
    mes,
  })

  return (
    <main className="min-h-screen bg-fondo text-texto">
      <header className="bg-tarjeta border-b border-borde px-4 py-4 flex items-center gap-3">
        <Link href={`/app/${slug}/empleado`} className="text-muted hover:text-dorado transition-colors" aria-label="Volver">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs text-dorado font-medium uppercase tracking-wider">IMPECABLE</p>
          <h1 className="font-bold text-lg">Mi calendario</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-end">
          <MesNav mes={mes} />
        </div>
        <CalendarioEmpleado celdas={celdas} />
      </div>
    </main>
  )
}
