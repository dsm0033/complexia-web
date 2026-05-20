'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'complexia-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  function respond(value) {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent('complexia-consent', { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-green-950 text-green-100 px-4 py-4 sm:px-6"
    >
      <div className="mx-auto max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed">
          Usamos cookies técnicas propias (necesarias) y cookies analíticas de{' '}
          <strong className="text-white">Google Analytics</strong> para medir el tráfico.
          Puedes aceptarlas o rechazarlas.{' '}
          <Link href="/legal/cookies" className="underline hover:text-white transition-colors">
            Más información
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => respond('rejected')}
            className="rounded-md border border-green-600 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-900 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={() => respond('accepted')}
            className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
