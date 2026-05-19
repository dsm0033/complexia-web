import { ImageResponse } from 'next/og';

export const alt = 'ComplexIA — Inteligencia aplicada. Resultados reales.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadGoogleFont(family, weight) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`;
  const css = await fetch(cssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  }).then((r) => r.text());

  const latin = css.match(/\/\*\s*latin\s*\*\/[\s\S]*?src:\s*url\(([^)]+)\)/);
  if (!latin) throw new Error(`No latin font URL for ${family} @${weight}`);
  return fetch(latin[1]).then((r) => r.arrayBuffer());
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
            fontSize: 32,
            fontWeight: 400,
            color: '#88CCA5',
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
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
