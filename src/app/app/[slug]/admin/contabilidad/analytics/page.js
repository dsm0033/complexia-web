import { getAdminPageCtx } from '@/lib/admin-context'
import { TrendingUp, TrendingDown, Minus, Percent } from 'lucide-react'
import { PLChart }          from './_components/PLChart'
import { ServiciosChart }   from './_components/ServiciosChart'
import { DiaSemanaChart, FranjaHorariaChart } from './_components/PeakHorasChart'
import { ClientesChart }    from './_components/ClientesChart'
import { EmpleadosChart }   from './_components/EmpleadosChart'

export const metadata = { title: 'Analytics · Admin IMPECABLE' }

function getLast12Months() {
  const result = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push(d.toISOString().slice(0, 7))
  }
  return result
}

function shortMonth(yyyymm) {
  const [y, m] = yyyymm.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('es-ES', { month: 'short' })
    .replace('.', '')
}

async function getAnalyticsData(supabase, businessId) {
  const last12 = getLast12Months()
  const startDate = last12[0] + '-01'

  const [
    { data: invoices },
    { data: expenses },
    { data: services },
    { data: bookings },
    { data: allSvcDates },
  ] = await Promise.all([
    supabase.from('invoices')
      .select('invoice_date, total_amount')
      .eq('business_id', businessId)
      .gte('invoice_date', startDate),
    supabase.from('expenses')
      .select('date, amount')
      .eq('business_id', businessId)
      .gte('date', startDate),
    supabase.from('service_records')
      .select('date, customer_id, status, started_at, completed_at, services(name), employees(full_name)')
      .eq('business_id', businessId)
      .gte('date', startDate),
    supabase.from('bookings')
      .select('time_slot')
      .eq('business_id', businessId)
      .gte('date', startDate)
      .neq('status', 'cancelado'),
    supabase.from('service_records')
      .select('customer_id, date')
      .eq('business_id', businessId)
      .not('customer_id', 'is', null),
  ])

  // ── P&L por mes ──
  const ingByMonth  = Object.fromEntries(last12.map(m => [m, 0]))
  const gastByMonth = Object.fromEntries(last12.map(m => [m, 0]))
  invoices?.forEach(f => { const m = f.invoice_date.slice(0, 7); if (m in ingByMonth)  ingByMonth[m]  += Number(f.total_amount) })
  expenses?.forEach(e => { const m = e.date.slice(0, 7);         if (m in gastByMonth) gastByMonth[m] += Number(e.amount) })

  const plData = last12.map(m => ({
    mes:       shortMonth(m),
    ingresos:  Math.round(ingByMonth[m]  * 100) / 100,
    gastos:    Math.round(gastByMonth[m] * 100) / 100,
    beneficio: Math.round((ingByMonth[m] - gastByMonth[m]) * 100) / 100,
  }))

  const totalIngresos  = Object.values(ingByMonth).reduce((a, b) => a + b, 0)
  const totalGastos    = Object.values(gastByMonth).reduce((a, b) => a + b, 0)
  const totalBeneficio = totalIngresos - totalGastos
  const margen         = totalIngresos > 0 ? (totalBeneficio / totalIngresos) * 100 : 0

  // ── Servicios más vendidos ──
  const svcCounts = {}
  services?.forEach(s => {
    const name = s.services?.name ?? 'Sin servicio'
    svcCounts[name] = (svcCounts[name] ?? 0) + 1
  })
  const serviciosData = Object.entries(svcCounts)
    .map(([nombre, count]) => ({ nombre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // ── Horas punta — día de semana ──
  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]
  services?.forEach(s => {
    if (s.date) dayCounts[new Date(s.date + 'T12:00:00').getDay()]++
  })
  const diasData = DAYS.map((dia, i) => ({ dia, count: dayCounts[i] }))

  // ── Horas punta — franja horaria (de reservas) ──
  const hourCounts = {}
  bookings?.forEach(b => {
    if (b.time_slot) {
      const hour = String(b.time_slot).slice(0, 5)
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1
    }
  })
  const franjasData = Object.entries(hourCounts)
    .map(([hora, count]) => ({ hora, count }))
    .sort((a, b) => a.hora.localeCompare(b.hora))

  // ── Clientes nuevos vs recurrentes (últimos 6 meses) ──
  const firstByCustomer = {}
  allSvcDates?.forEach(({ customer_id, date }) => {
    if (!firstByCustomer[customer_id] || date < firstByCustomer[customer_id])
      firstByCustomer[customer_id] = date
  })
  const last6 = last12.slice(-6)
  const clientesData = last6.map(m => {
    const mStart = m + '-01', mEnd = m + '-31'
    const thisMonth = new Set(
      (allSvcDates ?? []).filter(s => s.date >= mStart && s.date <= mEnd).map(s => s.customer_id)
    )
    let nuevos = 0, recurrentes = 0
    thisMonth.forEach(cid => {
      const first = firstByCustomer[cid]
      if (first >= mStart && first <= mEnd) nuevos++
      else recurrentes++
    })
    return { mes: shortMonth(m), nuevos, recurrentes }
  })

  // ── Rendimiento por empleado ──
  const empStats = {}
  services?.filter(s => s.status === 'completado' && s.employees?.full_name).forEach(s => {
    const name = s.employees.full_name
    if (!empStats[name]) empStats[name] = { completados: 0, totalMin: 0, countTime: 0 }
    empStats[name].completados++
    if (s.started_at && s.completed_at) {
      const mins = (new Date(s.completed_at) - new Date(s.started_at)) / 60000
      if (mins > 0 && mins < 480) { empStats[name].totalMin += mins; empStats[name].countTime++ }
    }
  })
  const empleadosData = Object.entries(empStats)
    .map(([nombre, s]) => ({
      nombre:      nombre.split(' ')[0],
      completados: s.completados,
      tiempoMedio: s.countTime > 0 ? Math.round(s.totalMin / s.countTime) : null,
    }))
    .sort((a, b) => b.completados - a.completados)

  return { plData, totalIngresos, totalGastos, totalBeneficio, margen, serviciosData, diasData, franjasData, clientesData, empleadosData }
}

function euro(v) {
  return v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function SummaryCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    green:  { bg: 'bg-emerald-50', text: 'text-emerald-600', val: 'text-emerald-700' },
    red:    { bg: 'bg-rose-50',    text: 'text-rose-600',    val: 'text-rose-700'    },
    blue:   { bg: 'bg-blue-50',    text: 'text-blue-600',    val: 'text-blue-700'    },
    gray:   { bg: 'bg-gray-100',   text: 'text-gray-500',    val: 'text-gray-700'    },
  }
  const c = colors[color]
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className={`inline-flex p-2.5 rounded-lg ${c.bg} ${c.text} mb-4`}>
        <Icon size={20} />
      </div>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default async function AnalyticsPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const {
    plData, totalIngresos, totalGastos, totalBeneficio, margen,
    serviciosData, diasData, franjasData, clientesData, empleadosData,
  } = await getAnalyticsData(supabase, businessId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Últimos 12 meses</p>
      </div>

      {/* Tarjetas resumen P&L */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={TrendingUp}   label="Ingresos"      value={euro(totalIngresos)}  color="green" />
        <SummaryCard icon={TrendingDown} label="Gastos"        value={euro(totalGastos)}    color="red"   />
        <SummaryCard icon={Minus}        label="Beneficio neto" value={euro(totalBeneficio)} color={totalBeneficio >= 0 ? 'blue' : 'red'} />
        <SummaryCard icon={Percent}      label="Margen"        value={`${margen.toFixed(1)} %`} color="gray" sub="beneficio / ingresos" />
      </div>

      {/* Evolución mensual */}
      <Section title="Evolución mensual — Ingresos vs Gastos">
        <PLChart data={plData} />
      </Section>

      {/* Servicios más vendidos */}
      <Section title="Servicios más vendidos">
        <ServiciosChart data={serviciosData} />
      </Section>

      {/* Horas punta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Actividad por día de la semana">
          <DiaSemanaChart data={diasData} />
        </Section>
        <Section title="Reservas por franja horaria">
          <FranjaHorariaChart data={franjasData} />
        </Section>
      </div>

      {/* Clientes nuevos vs recurrentes */}
      <Section title="Clientes nuevos vs recurrentes (últimos 6 meses)">
        <ClientesChart data={clientesData} />
      </Section>

      {/* Rendimiento por empleado */}
      <Section title="Servicios completados por empleado">
        <EmpleadosChart data={empleadosData} />
      </Section>
    </div>
  )
}
