'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, Mail, MapPin } from 'lucide-react'
import { telHref, fullAddress } from '@/lib/business-contact'

const PRIVATE_PATHS = ['/admin', '/empleado', '/cliente']

const NAV_LINKS = [
  { href: '', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/reservar', label: 'Reservar cita' },
]

const INFO_LINKS = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/privacidad', label: 'Política de privacidad' },
  { href: '/cookies', label: 'Política de cookies' },
]

export default function Footer({ slug, business }) {
  const pathname = usePathname()

  // Prefijo /app/[slug] en enlaces internos — misma convención que Navbar.
  const base = `/app/${slug}`

  // El pathname puede venir con prefijo (complexia.es) o sin él (laimpecable.es)
  const rel = pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname
  if (PRIVATE_PATHS.some(p => rel.startsWith(p))) return null

  return (
    <footer className="bg-fondo border-t border-borde">
      <div className="max-w-[1100px] mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Columna 1 — Marca y contacto (datos de Configuración → Empresa) */}
        <div>
          <p className="font-serif font-black text-dorado text-xl tracking-wide mb-2 uppercase">
            {business?.name ?? ''}
          </p>
          {business?.tagline && (
            <p className="font-sans text-sm text-muted leading-relaxed mb-6">
              {business.tagline}
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {fullAddress(business) && (
              <li className="flex items-center gap-2 text-sm text-muted">
                <MapPin size={15} className="text-dorado shrink-0" strokeWidth={2} />
                {fullAddress(business)}
              </li>
            )}
            {business?.phone && (
              <li>
                <a href={telHref(business.phone)} className="flex items-center gap-2 text-sm text-muted hover:text-dorado transition-colors">
                  <Phone size={15} className="text-dorado shrink-0" strokeWidth={2} />
                  {business.phone}
                </a>
              </li>
            )}
            {business?.email && (
              <li>
                <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-sm text-muted hover:text-dorado transition-colors">
                  <Mail size={15} className="text-dorado shrink-0" strokeWidth={2} />
                  {business.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Columna 2 — Navegación */}
        <div>
          <p className="font-sans text-[11px] font-semibold tracking-[3px] uppercase text-dorado mb-5">
            Navegación
          </p>
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={label}>
                <Link href={`${base}${href}`} className="font-sans text-sm text-muted hover:text-texto transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3 — Información legal */}
        <div>
          <p className="font-sans text-[11px] font-semibold tracking-[3px] uppercase text-dorado mb-5">
            Información
          </p>
          <ul className="flex flex-col gap-3">
            {INFO_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={`${base}${href}`} className="font-sans text-sm text-muted hover:text-texto transition-colors">
                  {label}
                </Link>
              </li>
            ))}
            {/* /login es ruta de plataforma — sin prefijo de tenant */}
            <li>
              <Link href="/login" className="font-sans text-sm text-muted hover:text-texto transition-colors">
                Acceso clientes y empleados
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-borde px-6 py-5">
        <p className="font-sans text-xs text-sutil text-center">
          © {new Date().getFullYear()} {business?.name ?? ''}
          {business?.tagline ? ` · ${business.tagline}` : ''}
        </p>
      </div>
    </footer>
  )
}
