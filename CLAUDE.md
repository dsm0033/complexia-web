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
│   ├── layout.jsx              # Root layout: fuente, metadata, globals.css
│   ├── page.jsx                # Landing page — importa secciones en orden
│   ├── blog/
│   │   ├── page.jsx
│   │   └── [slug]/page.jsx
│   ├── servicios/
│   │   └── [slug]/page.jsx
│   ├── casos/
│   │   └── [slug]/page.jsx
│   └── api/
│       └── contacto/route.js   # POST handler con Resend
│
├── components/
│   ├── ui/                     # Primitivos reutilizables en TODA la app
│   │   ├── Navbar.jsx          # Sticky, responsive, 'use client'
│   │   ├── Footer.jsx          # Por construir
│   │   └── Button.jsx          # Por construir — variantes: primary / ghost
│   └── sections/               # Secciones de la landing únicamente
│       ├── Hero.jsx            # Hecho: H1 + subtitle + CTAs + stats bar
│       ├── Servicios.jsx       # Por construir
│       ├── Metodologia.jsx     # Por construir
│       ├── Casos.jsx           # Por construir (preview de casos)
│       ├── Nosotros.jsx        # Por construir
│       └── Contacto.jsx        # Por construir — formulario + llama al API route
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
3. `<Servicios />` — pendiente (ID: `#servicios`)
4. `<Metodologia />` — pendiente (ID: `#metodologia`)
5. `<Casos />` — pendiente (ID: `#casos`) — solo preview, el detalle va en `/casos/[slug]`
6. `<Nosotros />` — pendiente (ID: `#nosotros`)
7. `<Contacto />` — pendiente (ID: `#contacto`) — formulario real con Resend
8. `<Footer />` — pendiente

---

## Formulario de contacto

- El componente `Contacto.jsx` es `'use client'` y hace un `fetch POST` a `/api/contacto`
- `app/api/contacto/route.js` valida los campos y llama a `lib/mail.js`
- `lib/mail.js` usa el SDK de **Resend** para enviar el email
- Variable de entorno requerida: `RESEND_API_KEY` en `.env.local`

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
