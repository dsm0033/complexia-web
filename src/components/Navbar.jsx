"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
  { href: "/sobre-nosotros", label: "Nosotros" },
];

const PORTAL_ROUTES = ['/admin', '/empleado', '/cliente', '/login']

export default function Navbar({ slug }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Los enlaces internos llevan siempre el prefijo /app/[slug]
  // (convención del repo — funciona también bajo laimpecable.es,
  // el proxy no reescribe rutas que ya empiezan por /app/).
  const base = `/app/${slug}`

  // Ocultarse en portales: el pathname puede venir con prefijo
  // (/app/slug/admin en complexia.es) o sin él (/admin en laimpecable.es)
  const rel = pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname
  if (PORTAL_ROUTES.some(r => rel.startsWith(r))) return null

  return (
    <div>
      {/* Barra de navegación */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-fondo/96 backdrop-blur-md border-b border-borde"
            : "bg-fondo/85 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            href={base}
            className="font-serif font-black text-dorado text-xl tracking-wide hover:text-dorado-dim transition-colors relative inline-block"
          >
            <span className="font-script absolute text-texto" style={{ fontSize: "0.85em", top: "50%", transform: "translateY(-50%) rotate(-30deg)", left: "-1.1em" }}>
              La
            </span>
            IMPECABLE
          </Link>

          {/* Nav escritorio */}
          <nav className="hidden sm:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={`${base}${href}`}
                className="font-sans text-sm font-medium text-muted hover:text-dorado transition-colors tracking-wide outline-none"
              >
                {label}
              </Link>
            ))}
            {/* /login es ruta de plataforma — sin prefijo de tenant */}
            <Link
              href="/login"
              className="font-sans text-sm font-medium text-muted hover:text-dorado transition-colors tracking-wide outline-none"
            >
              Entrar
            </Link>
            <ThemeToggle />
            <Link
              href={`${base}/reservar`}
              className="font-sans text-sm font-semibold px-5 py-2 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
            >
              Reservar
            </Link>
          </nav>

          {/* Botón hamburguesa (móvil) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden flex flex-col justify-center gap-[5px] w-8 h-8"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span className={`block h-[2px] bg-dorado transition-all duration-300 origin-center w-5 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-[2px] bg-dorado transition-all duration-300 w-5 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-[2px] bg-dorado transition-all duration-300 origin-center w-5 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Menú móvil — overlay fijo bajo la navbar */}
      {menuOpen && (
        <div className="sm:hidden fixed top-16 left-0 right-0 bottom-0 z-40 bg-fondo border-t border-borde flex flex-col items-center justify-center gap-0 px-8">
          {NAV_LINKS.map(({ href, label }) => (
            <div key={href} className="w-full">
              <Link
                href={`${base}${href}`}
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center py-6 font-sans font-medium text-muted hover:text-dorado transition-colors tracking-wide outline-none"
                style={{ fontSize: "24px" }}
              >
                {label}
              </Link>
              <div className="w-full h-px bg-borde" />
            </div>
          ))}
          <div className="mt-10 flex flex-col items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="font-sans text-base font-medium text-muted hover:text-dorado transition-colors tracking-wide"
            >
              Entrar
            </Link>
            <Link
              href={`${base}/reservar`}
              onClick={() => setMenuOpen(false)}
              className="inline-flex font-sans text-base font-semibold px-10 py-4 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
            >
              Reservar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
