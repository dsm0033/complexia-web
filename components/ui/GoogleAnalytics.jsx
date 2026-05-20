'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';

const GA_ID = 'G-GDHJTV4LZX';
const CONSENT_KEY = 'complexia-cookie-consent';

export default function GoogleAnalytics() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    setConsent(localStorage.getItem(CONSENT_KEY));

    function onConsent(e) {
      setConsent(e.detail);
    }
    window.addEventListener('complexia-consent', onConsent);
    return () => window.removeEventListener('complexia-consent', onConsent);
  }, []);

  if (consent !== 'accepted') return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
