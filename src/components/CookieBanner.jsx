'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PRIVATE_PATHS = ['/admin', '/empleado', '/cliente']

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true)
  }, [])

  if (!visible || PRIVATE_PATHS.some(p => pathname.startsWith(p))) return null

  const accept = (type) => {
    localStorage.setItem('cookie_consent', type)
    // Avisa a <Analytics /> para que cargue GA4 en esta misma sesión si se aceptan todas
    window.dispatchEvent(new Event('cookie-consent-changed'))
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Usamos cookies 🍪</p>
          <p className="text-sm text-gray-600 mt-1">
            Usamos cookies propias para gestionar tu sesión y procesar pagos de forma segura, y cookies
            analíticas de Google Analytics (terceros) para entender cómo se usa la web. Estas últimas solo
            se activan si pulsas «Aceptar todas».{' '}
            <Link href="/cookies" className="underline hover:text-gray-900">
              Más información
            </Link>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => accept('necessary')}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Solo necesarias
          </button>
          <button
            onClick={() => accept('all')}
            className="px-4 py-2 text-sm bg-dorado hover:bg-dorado-dim text-white rounded-md font-medium"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  )
}
