'use client'

// ============================================
// 📊 GOOGLE ANALYTICS (GA4) — con consentimiento RGPD
// ============================================
// Carga Google Analytics SOLO si el usuario ha aceptado "todas" las cookies
// en el CookieBanner (localStorage cookie_consent === 'all').
//
// - Si la variable NEXT_PUBLIC_GA_ID no está definida, este componente no
//   hace nada (inerte). Así el código va en producción sin medir hasta que
//   se pegue el Measurement ID (G-XXXXXXXXXX) en Vercel + .env.local.
// - Reacciona en la misma sesión al evento 'cookie-consent-changed' que
//   dispara el CookieBanner al pulsar "Aceptar todas".
//
// Para cambiar/retirar el consentimiento más tarde haría falta recargar la
// página (GA ya cargado no se descarga solo) — fuera de alcance por ahora.
// ============================================

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { GoogleAnalytics } from '@next/third-parties/google'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Solo medimos la web pública; los portales privados no se rastrean para no
// ensuciar las estadísticas (misma convención que CookieBanner).
const PRIVATE_PATHS = ['/admin', '/empleado', '/cliente']

export default function Analytics() {
  const [consented, setConsented] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const check = () => setConsented(localStorage.getItem('cookie_consent') === 'all')
    check()
    window.addEventListener('cookie-consent-changed', check)
    return () => window.removeEventListener('cookie-consent-changed', check)
  }, [])

  if (!GA_ID || !consented) return null
  if (PRIVATE_PATHS.some(p => pathname.startsWith(p))) return null

  return <GoogleAnalytics gaId={GA_ID} />
}
