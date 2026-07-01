import { Instrument_Sans } from 'next/font/google';
import CookieBanner from '@/components/ui/CookieBanner';
import GoogleAnalytics from '@/components/ui/GoogleAnalytics';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
});

export const metadata = {
  metadataBase: new URL('https://www.complexia.es'),
  title: 'ComplexIA — Inteligencia aplicada. Resultados reales.',
  description:
    'Consultoría de IA para PYMEs españolas. Diagnóstico, desarrollo a medida, chatbots, pasarelas de pago y acompañamiento. Soluciones accesibles con resultados medibles.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ComplexIA — Inteligencia aplicada. Resultados reales.',
    description:
      'Consultoría de IA para PYMEs. Diagnóstico, desarrollo a medida y acompañamiento, sin tecnicismos y con resultados medibles.',
    url: 'https://www.complexia.es',
    siteName: 'ComplexIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: next-themes (tema del tenant) añade la clase
    // dark/light a <html> antes de hidratar — sin esto React avisa en consola
    <html lang="es" className={instrumentSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        {children}
        <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
