'use client';

import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Isotipo from './Isotipo';

const links = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Metodología', href: '#metodologia' },
  { label: 'Casos de éxito', href: '#casos' },
  { label: 'Nosotros', href: '#nosotros' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-green-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-green-950" aria-label="ComplexIA — inicio">
            <Isotipo className="h-9 w-9 text-green-700" />
            Complex<span className="text-green-700">IA</span>
          </a>

          {/* Desktop nav */}
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-7">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-green-800 hover:text-green-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a
              href="#contacto"
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
            >
              Contacto
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-green-800 hover:bg-green-50 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-green-100 bg-white px-4 pb-4 pt-2">
          <nav aria-label="Navegación móvil" className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3">
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="block w-full rounded-md bg-green-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-800 transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
