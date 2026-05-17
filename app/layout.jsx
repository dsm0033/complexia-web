import { Instrument_Sans } from 'next/font/google';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
});

export const metadata = {
  title: 'ComplexIA',
  description: 'ComplexIA — plataforma de inteligencia artificial',
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
