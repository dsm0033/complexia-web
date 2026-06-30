import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';
export const alt = 'ComplexIA — Inteligencia aplicada. Resultados reales.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadGoogleFont(family, weight) {
  // Sin User-Agent moderno: Google Fonts devuelve TTF (Satori no soporta WOFF2)
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`;
  const css = await fetch(cssUrl).then((r) => r.text());

  const ttf = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(truetype|opentype)['"]?\)/);
  if (!ttf) throw new Error(`No TTF/OTF URL for ${family} @${weight}`);
  return fetch(ttf[1]).then((r) => r.arrayBuffer());
}

export default async function OpengraphImage() {
  const [bold, regular] = await Promise.all([
    loadGoogleFont('Instrument Sans', 700),
    loadGoogleFont('Instrument Sans', 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0D2618',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          fontFamily: 'Instrument Sans',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 156,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#FFFFFF' }}>Complex</span>
          <span style={{ color: '#88CCA5' }}>IA</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 26,
            fontWeight: 400,
            color: '#88CCA5',
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            whiteSpace: 'nowrap',
          }}
        >
          Inteligencia aplicada. Resultados reales.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Instrument Sans', data: bold, style: 'normal', weight: 700 },
        { name: 'Instrument Sans', data: regular, style: 'normal', weight: 400 },
      ],
    },
  );
}
