'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, FileText, Palmtree, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export default function EmpleadoNav({ slug, vacacionesNoLeidas = 0, esAdmin = false }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const base = `/app/${slug}/empleado`
  const adminBase = `/app/${slug}/admin`

  const item = 'flex items-center gap-2 text-sm text-dorado hover:text-dorado/80 transition-colors'
  const itemMobile = `${item} px-3 py-2.5 rounded-lg hover:bg-fondo/50`

  const Items = ({ mobile }) => {
    const cls = mobile ? itemMobile : item
    const onClick = mobile ? close : undefined
    return (
      <>
        <Link href={`${base}/calendario`} onClick={onClick} className={cls}>
          <Calendar size={16} /> Mi calendario
        </Link>
        <Link href={`${base}/mis-horas`} onClick={onClick} className={cls}>
          <Clock size={16} /> Mis horas
        </Link>
        <Link href={`${base}/nominas`} onClick={onClick} className={cls}>
          <FileText size={16} /> Nóminas
        </Link>
        <Link href={`${base}/vacaciones`} onClick={onClick} className={`relative ${cls}`}>
          <Palmtree size={16} /> Vacaciones
          {vacacionesNoLeidas > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {vacacionesNoLeidas}
            </span>
          )}
        </Link>
        {esAdmin && (
          <Link
            href={adminBase}
            onClick={onClick}
            className={`${cls} !text-muted hover:!text-dorado`}
          >
            <LayoutDashboard size={16} /> Admin
          </Link>
        )}
        <form action={logout} className={mobile ? 'w-full' : ''}>
          <button
            type="submit"
            className={`${mobile ? itemMobile : item} !text-muted hover:!text-red-400 w-full`}
          >
            <LogOut size={16} /> Salir
          </button>
        </form>
      </>
    )
  }

  return (
    <>
      {/* Escritorio: enlaces en fila */}
      <div className="hidden md:flex items-center gap-3">
        <Items mobile={false} />
      </div>

      {/* Móvil: hamburguesa */}
      <div className="md:hidden relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="p-1.5 text-dorado hover:text-dorado/80"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={close} />
            <div className="absolute right-0 top-full mt-2 z-50 bg-tarjeta border border-borde rounded-xl shadow-lg p-2 flex flex-col gap-0.5 min-w-[190px]">
              <Items mobile={true} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
