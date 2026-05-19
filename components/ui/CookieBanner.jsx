'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'complexia-cookie-notice';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
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
          Esta web usa cookies técnicas propias y analiza el tráfico de forma anónima con{' '}
          <strong className="text-white">Fathom Analytics</strong> (sin cookies ni rastreo personal).{' '}
          <Link href="/legal/cookies" className="underline hover:text-white transition-colors">
            Más información
          </Link>
          .
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
