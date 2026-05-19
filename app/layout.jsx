import { Instrument_Sans } from 'next/font/google';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
});

export const metadata = {
  metadataBase: new URL('https://complexia.es'),
  title: 'ComplexIA — Inteligencia aplicada. Resultados reales.',
  description:
    'Consultoría de IA para PYMEs españolas. Diagnóstico, desarrollo a medida, chatbots, pasarelas de pago y acompañamiento. Soluciones accesibles con resultados medibles.',
  openGraph: {
    title: 'ComplexIA — Inteligencia aplicada. Resultados reales.',
    description:
      'Consultoría de IA para PYMEs. Diagnóstico, desarrollo a medida y acompañamiento, sin tecnicismos y con resultados medibles.',
    url: 'https://complexia.es',
    siteName: 'ComplexIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={instrumentSans.variable}>
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
