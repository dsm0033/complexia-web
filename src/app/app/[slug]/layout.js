// ============================================
// 🎨 LAYOUT DEL TENANT — /app/[slug]/**
// ============================================
// Restaura la capa de presentación que en la-impecable
// vivía en el root layout: fuentes de marca, tema
// claro/oscuro (next-themes) y Navbar/Footer públicos.
// Navbar y Footer se ocultan solos en los portales
// (admin/empleado/cliente) — ver PORTAL_ROUTES en cada uno.
//
// El wrapper .tenant-theme activa los estilos escopados
// de globals.css (paleta dorada, fuentes, selection…)
// sin afectar a la landing de ComplexIA.
// ============================================

import { Playfair_Display, DM_Sans, Pinyon_Script } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
  display: 'swap',
})

export default async function TenantLayout({ children, params }) {
  const { slug } = await params

  return (
    <ThemeProvider>
      <div
        className={`tenant-theme ${playfair.variable} ${dmSans.variable} ${pinyonScript.variable}`}
      >
        <Navbar slug={slug} />
        {children}
        <Footer slug={slug} />
      </div>
    </ThemeProvider>
  )
}
