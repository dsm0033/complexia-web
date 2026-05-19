import { EnvelopeIcon } from '@heroicons/react/24/outline';
import Isotipo from './Isotipo';

const navegacion = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Metodología', href: '/#metodologia' },
  { label: 'Casos', href: '/#casos' },
  { label: 'Contacto', href: '/#contacto' },
];

const informacion = [
  { label: 'Aviso legal', href: '/legal/aviso-legal' },
  { label: 'Política de privacidad', href: '/legal/privacidad' },
  { label: 'Política de cookies', href: '/legal/cookies' },
];

export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-100" aria-label="Pie de página">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">

          {/* Columna 1 — Marca + contacto */}
          <div>
            <p className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <Isotipo className="h-9 w-9 text-green-400" />
              Complex<span className="text-green-400">IA</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-green-300">
              Inteligencia aplicada. Resultados reales.
            </p>
            <a
              href="mailto:contacto@complexia.es"
              className="mt-6 inline-flex items-center gap-2 text-sm text-green-100 hover:text-white transition-colors"
            >
              <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
              contacto@complexia.es
            </a>
          </div>

          {/* Columna 2 — Navegación */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
              Navegación
            </p>
            <ul className="mt-5 space-y-3">
              {navegacion.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-green-100 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Información (legal) */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
              Información
            </p>
            <ul className="mt-5 space-y-3">
              {informacion.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-green-100 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-green-800 pt-6 text-center text-xs text-green-400">
          © {new Date().getFullYear()} ComplexIA. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
