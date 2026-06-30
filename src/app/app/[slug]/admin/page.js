import Link from 'next/link'
import { getAdminPageCtx, getAdminStats } from '@/lib/admin-context'
import { Users, Wrench, UserCheck, ClipboardList, CalendarDays, Banknote, CheckSquare, Palmtree, Settings, FileSpreadsheet, Building2, TrendingDown, BarChart2 } from 'lucide-react'

// AÑADIR UNA TARJETA NUEVA AL DASHBOARD:
// 1) Añade el campo en el json_build_object de la migración
//    supabase/migrations/20260517030000_admin_stats_rpc.sql y aplícala.
// 2) Añade el campo aquí en el objeto `stats` con un default razonable.
// 3) Añade su <StatCard /> en el JSX de abajo.
// Si te saltas el paso 1, el campo será undefined y la tarjeta mostrará 0.

export default async function AdminDashboard() {
  const { profile, businessId } = await getAdminPageCtx()

  // Misma RPC que usa el layout para los badges — React.cache deduplica
  // la llamada y el dashboard se renderiza sin queries extra.
  const data = await getAdminStats(businessId)
  const stats = {
    clients:              data?.clients              ?? 0,
    employees:            data?.employees            ?? 0,
    services:             data?.services             ?? 0,
    serviciosMes:         data?.serviciosMes         ?? 0,
    pendingServices:      data?.pendingServices      ?? 0,
    reservasMes:          data?.reservasMes          ?? 0,
    reservasPendientes:   data?.reservasPendientes   ?? 0,
    totalFacturado:       Number(data?.totalFacturado ?? 0),
    gastosMes:            Number(data?.gastosMes      ?? 0),
    checklists:           data?.checklists           ?? 0,
    vacacionesPendientes: data?.vacacionesPendientes ?? 0,
    nominasConContrato:   data?.nominasConContrato   ?? 0,
  }

  // Beneficio del mes = ingresos facturados − gastos. Puede ser negativo.
  const beneficioMes = stats.totalFacturado - stats.gastosMes

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido, {profile?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={CalendarDays}    label="Reservas este mes"  value={stats.reservasMes}    href="/admin/reservas"  badge={stats.reservasPendientes > 0 ? `${stats.reservasPendientes} pendientes` : null} />
        <StatCard icon={Users}           label="Clientes"           value={stats.clients}        href="/admin/clientes" />
        <StatCard icon={Wrench}          label="Servicios activos"  value={stats.services}       href="/admin/servicios" />
        <StatCard icon={UserCheck}       label="Empleados activos"  value={stats.employees}      href="/admin/empleados" />
        <StatCard icon={ClipboardList}   label="Servicios este mes" value={stats.serviciosMes}   href="/admin/historial" badge={stats.pendingServices > 0 ? `${stats.pendingServices} pendientes` : null} />
        <StatCard icon={Banknote}        label="Facturado este mes" value={`${stats.totalFacturado.toFixed(2)} €`} href="/admin/facturas" isText accent />
        <StatCard icon={TrendingDown}    label="Gastos este mes"    value={`${stats.gastosMes.toFixed(2)} €`}      href="/admin/contabilidad/gastos" isText />
        <StatCard icon={BarChart2}       label="Beneficio este mes" value={`${beneficioMes.toFixed(2)} €`} href="/admin/contabilidad/analytics" isText negative={beneficioMes < 0} />
        <StatCard icon={FileSpreadsheet} label="Nóminas"            value={stats.nominasConContrato}   href="/admin/nominas" badge={stats.nominasConContrato > 0 ? `${stats.nominasConContrato} con contrato activo` : 'Sin contratos'} badgeGray />
        <StatCard icon={CheckSquare}     label="Checklists"         value={stats.checklists}           href="/admin/checklists" />
        <StatCard icon={Palmtree}        label="Vacaciones"         value={stats.vacacionesPendientes} href="/admin/configuracion/vacaciones" badge={stats.vacacionesPendientes > 0 ? `${stats.vacacionesPendientes} por revisar` : null} />
        <StatCard icon={Building2}       label="Empresa"            href="/admin/configuracion/empresa"  isLink linkText="Gestionar" />
        <StatCard icon={Settings}        label="Configuración"      href="/admin/configuracion/reservas" isLink linkText="Gestionar" />
      </div>
    </div>
  )
}

// Paleta on-brand: todos los iconos en el dorado de marca. El acento (accent)
// resalta además la cifra del dato estrella (facturado) en dorado; el beneficio
// negativo va en rojo. Badges en rojo ("pendientes/por revisar") o gris (info).
function StatCard({ icon: Icon, label, value, href, badge, badgeGray, accent, negative, isText, isLink, linkText = 'Gestionar' }) {
  const valueColor = accent ? 'text-dorado' : negative ? 'text-red-600' : 'text-gray-900'
  return (
    <Link href={href} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 block transition-transform hover:-translate-y-1">
      <div className="inline-flex p-3 rounded-lg mb-4 bg-dorado/15 text-dorado">
        <Icon size={22} />
      </div>
      {isLink ? (
        <p className="text-sm font-medium text-gray-400 mt-1">{linkText} →</p>
      ) : (
        <p className={`font-bold ${isText ? 'text-2xl' : 'text-3xl'} ${valueColor}`}>{value}</p>
      )}
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {badge && (
        <p className={`text-xs font-medium mt-2 ${badgeGray ? 'text-gray-400' : 'text-red-600'}`}>{badge}</p>
      )}
    </Link>
  )
}
