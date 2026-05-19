# CLAUDE.md — ComplexIA

Guía de trabajo para Claude en este proyecto.

---

## Qué es este proyecto

**ComplexIA** es una web corporativa (landing + páginas interiores) para una consultoría de IA dirigida a PYMEs españolas. El objetivo es generar leads: el usuario lee, se convence y rellena el formulario de contacto.

---

## Stack y versiones

- **Next.js 16** con **App Router** (no Pages Router)
- **React 19**
- **JavaScript / JSX** — no TypeScript en este proyecto
- **Tailwind CSS v4** — configuración en `@theme` dentro de `globals.css` (sin `tailwind.config.js`)
- **Heroicons v2** para iconos (`@heroicons/react`)
- **Resend** para el envío de emails desde el formulario de contacto
- **Instrument Sans** como única fuente (cargada con `next/font/google`, pesos 400/500/600/700)
- **ESLint 9** con flat config (`eslint.config.mjs`)

---

## Estructura de carpetas

```
complexia-web/
├── app/                        # App Router de Next.js
│   ├── layout.jsx              # Root layout: fuente, metadata SEO + OG, globals.css
│   ├── page.jsx                # Landing page — importa secciones en orden
│   ├── icon.svg                # Favicon (isotipo en green-700)
│   ├── opengraph-image.jsx     # OG image 1200×630 generada con next/og
│   ├── blog/
│   │   ├── page.jsx
│   │   └── [slug]/page.jsx
│   ├── servicios/
│   │   └── [slug]/page.jsx
│   ├── casos/
│   │   └── [slug]/page.jsx
│   ├── legal/                  # Páginas legales (RGPD / LSSI)
│   │   ├── layout.jsx          # Wrapper con Navbar y Footer
│   │   ├── aviso-legal/page.jsx
│   │   ├── privacidad/page.jsx
│   │   └── cookies/page.jsx
│   └── api/
│       └── contacto/route.js   # POST handler con Resend
│
├── components/
│   ├── ui/                     # Primitivos reutilizables en TODA la app
│   │   ├── Navbar.jsx          # Sticky, responsive, 'use client'. Logo: Isotipo + wordmark
│   │   ├── Footer.jsx          # 3 columnas. Logo: Isotipo + wordmark sobre green-950
│   │   ├── Isotipo.jsx         # SVG inline del logo, fill="currentColor" (Tailwind-friendly)
│   │   └── Button.jsx          # Por construir — variantes: primary / ghost
│   └── sections/               # Secciones de la landing únicamente
│       ├── Hero.jsx            # H1 + subtitle + CTAs + stats bar + isotipo decorativo de fondo
│       ├── Servicios.jsx       # Grid 2 columnas, 4 servicios
│       ├── Metodologia.jsx     # Pasos de la consultoría
│       ├── Casos.jsx           # Caso destacado La Impecable + enlace al dominio
│       └── Contacto.jsx        # Formulario con consentimiento RGPD + POST al API
│
├── content/                    # Datos estáticos en JSON
│   ├── servicios.json
│   ├── casos.json
│   └── blog/                   # Un .json o .mdx por artículo
│
├── lib/
│   ├── tokens.js               # Design tokens (paleta verde en HSL)
│   └── mail.js                 # Función sendContactEmail() con Resend
│
├── docs/
│   ├── ARQUITECTURA.md
│   ├── SPRINTS.md
│   ├── PRODUCT_BACKLOG.md
│   ├── como-esta-hecha-la-web.md
│   └── brand/                  # Activos e historial visual de marca (uso interno)
│       ├── Logo-ComplexIA.png         # Guía visual de marca original
│       ├── isotipo.svg                # Versión final del isotipo
│       ├── wordmark-tagline.png       # Mockup del wordmark (referencia)
│       ├── prompts-graficos.md        # Prompts para generar más activos
│       └── iteraciones/               # PNGs intermedios descartados
│
└── public/
    └── images/
```

---

## Convenciones de código

### Componentes
- Un componente por archivo, nombre en PascalCase, extensión `.jsx`
- `'use client'` solo cuando el componente usa hooks de React o eventos del browser
- Las secciones de la landing van en `components/sections/`, los primitivos en `components/ui/`

### Estilos
- Usar **exclusivamente clases de Tailwind** — no CSS inline, no módulos CSS
- La paleta de color es la verde personalizada; no usar los colores Tailwind por defecto (`slate`, `zinc`, etc.)
- Espaciado y layout siguiendo el sistema de la landing: `max-w-7xl`, padding `px-4 sm:px-6 lg:px-8`

### Paleta verde (tokens)

| Clase Tailwind | Uso |
|---|---|
| `green-950` | Títulos principales (casi negro) |
| `green-900` | Fondos oscuros (stats bar) |
| `green-800` | Texto secundario, hover |
| `green-700` | Color de marca — botones primarios, enlaces |
| `green-300` | Texto sobre fondos oscuros |
| `green-100` | Fondos de pills, bordes suaves |
| `green-50` | Fondos de secciones alternadas |

### Importaciones
- Alias `@/` apunta a la raíz de `complexia-web/` (configurado en `jsconfig.json`)
- Orden: librerías externas → componentes internos → lib/utils

---

## Secciones de la landing — estado y orden

El archivo `app/page.jsx` importa las secciones en este orden:

1. `<Navbar />` — hecho
2. `<Hero />` — hecho (stats bar incluida)
3. `<Servicios />` — hecho (ID: `#servicios`)
4. `<Metodologia />` — hecho (ID: `#metodologia`)
5. `<Casos />` — hecho (ID: `#casos`) — solo preview con caso La Impecable; el detalle irá en `/casos/[slug]`
6. `<Contacto />` — hecho (ID: `#contacto`) — formulario con consentimiento RGPD, llama al API route
7. `<Footer />` — hecho

> La sección Nosotros se descartó. La navegación todavía contiene un enlace muerto a `#nosotros` en `Navbar.jsx` (a limpiar más adelante).

---

## Formulario de contacto

- El componente `Contacto.jsx` es `'use client'` y hace un `fetch POST` a `/api/contacto`.
- **Checkbox de consentimiento RGPD obligatorio** con enlace a `/legal/privacidad`. El botón Enviar permanece deshabilitado hasta marcarlo.
- `app/api/contacto/route.js` valida los campos, exige `consentimiento === true` (devuelve 400 si no), y llama a `lib/mail.js`.
- `lib/mail.js` usa el SDK de **Resend** para enviar el email.
- Variable de entorno requerida: `RESEND_API_KEY` en `.env.local` y en Vercel.

---

## Páginas legales

- `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies` existen como **placeholders "En redacción"**.
- Comparten `app/legal/layout.jsx`, que envuelve cada página con Navbar y Footer.
- Los textos legales reales y el banner de cookies (con bloqueo de analytics hasta consentimiento) están en el backlog (FASE 5).

---

## Identidad de marca y SEO

- **Isotipo**: el monograma "C" del logo vive en dos sitios:
  - `app/icon.svg` — favicon (Next.js lo sirve en `/icon.svg` automáticamente).
  - `components/ui/Isotipo.jsx` — componente React con el mismo `path` y `fill="currentColor"`. Se usa en Navbar (`text-green-700`), Footer (`text-green-400`) y como decoración gigante de fondo en el Hero (`text-green-100`).
- **Wordmark**: sigue siendo texto puro (`Complex<span>IA</span>`), no SVG, para conservar SEO y accesibilidad. El `<span>` envuelve "Complex" + "IA" para que el `gap` del `inline-flex` no los separe.
- **Open Graph image**: `app/opengraph-image.jsx` la genera dinámicamente con `next/og` (motor Satori) cargando Instrument Sans desde Google Fonts en formato TTF. Importante: **Satori no soporta WOFF2** — hay que pedir TTF al CSS de Google sin User-Agent moderno.
- **Metadata SEO**: `app/layout.jsx` define `metadataBase`, `title`, `description` y el bloque `openGraph` con `siteName`, `locale: es_ES`. La imagen OG se asocia automáticamente.
- **Activos archivados**: `docs/brand/` contiene la guía visual original, iteraciones descartadas y los prompts para regenerar.

---

## Páginas interiores

Las páginas de blog, servicios y casos son Server Components que leen de `content/`.
No hay CMS en esta fase: el contenido se gestiona como archivos JSON en el repo.

---

## Qué NO hacer

- No usar TypeScript (el proyecto es JSX puro)
- No añadir librerías de UI externas (Radix, shadcn, etc.) — construir los componentes a mano
- No usar CSS-in-JS ni módulos CSS
- No añadir animaciones con Framer Motion hasta que esté acordado
- No crear abstracciones prematuras: tres secciones similares no necesitan un componente genérico

---

## Comandos útiles

```bash
cd complexia-web
npm run dev      # Desarrollo en localhost:3000
npm run build    # Build de producción
npm run lint     # ESLint
```
