'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Wrench, UserCheck, ClipboardList, CheckSquare, LogOut, Menu, X, ExternalLink, CalendarDays, CalendarClock, Settings, Palmtree, Banknote, FileSpreadsheet, Building2, TrendingDown, BarChart2, Percent } from 'lucide-react'
import { logout } from '@/app/actions/auth'

function buildNav(slug) {
  const base = `/app/${slug}/admin`
  return [
    { href: base,                                   label: 'Dashboard',     icon: LayoutDashboard },
    { href: `${base}/reservas`,                     label: 'Reservas',      icon: CalendarDays },
    { href: `${base}/agenda`,                       label: 'Agenda',        icon: CalendarClock },
    { href: `${base}/clientes`,                     label: 'Clientes',      icon: Users },
    { href: `${base}/servicios`,                    label: 'Servicios',     icon: Wrench },
    { href: `${base}/empleados`,                    label: 'Empleados',     icon: UserCheck },
    { href: `${base}/historial`,                    label: 'Historial',     icon: ClipboardList },
    { href: `${base}/facturas`,                     label: 'Facturas',      icon: Banknote },
    { href: `${base}/nominas`,                      label: 'Nóminas',       icon: FileSpreadsheet },
    { href: `${base}/contabilidad/gastos`,          label: 'Gastos',        icon: TrendingDown },
    { href: `${base}/contabilidad/analytics`,       label: 'Analytics',     icon: BarChart2 },
    { href: `${base}/contabilidad/libro-iva`,       label: 'Libro de IVA',  icon: Percent },
    { href: `${base}/checklists`,                   label: 'Checklists',    icon: CheckSquare },
    { href: `${base}/configuracion/vacaciones`,     label: 'Vacaciones',    icon: Palmtree },
    { href: `${base}/configuracion/reservas`,       label: 'Configuración', icon: Settings },
    { href: `${base}/configuracion/empresa`,        label: 'Empresa',       icon: Building2 },
  ]
}

export default function AdminSidebar({ slug, pendingCount = 0, vacationPendingCount = 0 }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const NAV = buildNav(slug)
  const base = `/app/${slug}/admin`

  return (
    <>
      {/* Header móvil */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-gray-900 h-14 flex items-center px-4 border-b border-gray-800">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white p-1"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        <span className="ml-3 font-bold text-yellow-400 tracking-wide">IMPECABLE</span>
      </div>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col z-40 transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Cabecera sidebar escritorio */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg text-yellow-400 tracking-wide">IMPECABLE</span>
            <p className="text-xs text-gray-400 mt-1">Panel de administración</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== base && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {href === `${base}/historial` && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {pendingCount}
                  </span>
                )}
                {href === `${base}/configuracion/vacaciones` && vacationPendingCount > 0 && (
                  <span className="bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {vacationPendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-1">
          <a
            href={`/app/${slug}/empleado`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ExternalLink size={18} />
            <span className="flex-1">Vista empleado</span>
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
