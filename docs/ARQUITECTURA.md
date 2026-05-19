# ARQUITECTURA TÉCNICA — COMPLEXIA
*Última actualización: 19 Mayo 2026*

## Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | Next.js 16 + React 19 | App Router, Server Components |
| Estilos | Tailwind CSS v4 | Sin CSS-in-JS, @theme en globals.css |
| Iconos | Heroicons v2 | `@heroicons/react` |
| Email | Resend | Formulario de contacto |
| Fuente | Instrument Sans | `next/font/google` (pesos 400/500/600/700) |
| Hosting | Vercel | CI/CD desde GitHub (branch main) |
| Lenguaje | JavaScript / JSX | Sin TypeScript |

---

## Estructura de Carpetas

```
complexia-web/
├── app/                        # Rutas (App Router)
│   ├── layout.jsx              # ✅ Root layout: fuente, metadata SEO + OG, skip-link
│   ├── page.jsx                # ✅ Landing — importa secciones en orden
│   ├── icon.svg                # ✅ Favicon (isotipo en green-700)
│   ├── opengraph-image.jsx     # ✅ OG image 1200×630 con next/og + Satori
│   ├── blog/
│   │   ├── page.jsx            # 📋 Índice del blog
│   │   └── [slug]/page.jsx     # 📋 Artículo individual
│   ├── servicios/
│   │   └── [slug]/page.jsx     # 📋 Detalle de servicio
│   ├── casos/
│   │   └── [slug]/page.jsx     # 📋 Caso de éxito detallado
│   ├── legal/                  # ✅ Páginas legales (placeholders "En redacción")
│   │   ├── layout.jsx          # Wrapper con Navbar + Footer
│   │   ├── aviso-legal/page.jsx
│   │   ├── privacidad/page.jsx
│   │   └── cookies/page.jsx
│   └── api/
│       └── contacto/route.js   # ✅ POST: valida + consentimiento RGPD + Resend
│
├── components/
│   ├── ui/                     # Primitivos reutilizables en toda la app
│   │   ├── Navbar.jsx          # ✅ Sticky, responsive, 'use client'. Logo: Isotipo + wordmark
│   │   ├── Footer.jsx          # ✅ 3 columnas (marca · navegación · legal). Logo: Isotipo + wordmark
│   │   ├── Isotipo.jsx         # ✅ SVG inline del logo, fill="currentColor"
│   │   └── Button.jsx          # 📋 Pendiente — variantes: primary / ghost
│   └── sections/               # Secciones de la landing únicamente
│       ├── Hero.jsx            # ✅ H1 + CTAs + stats + isotipo decorativo de fondo (xl+)
│       ├── Servicios.jsx       # ✅ Grid 2 cols, 4 servicios
│       ├── Metodologia.jsx     # ✅ Pasos de la consultoría
│       ├── Casos.jsx           # ✅ Caso La Impecable + enlace al dominio
│       └── Contacto.jsx        # ✅ Formulario + consentimiento RGPD
│
├── content/                    # Datos estáticos en JSON (sin CMS)
│   ├── servicios.json          # 📋 Pendiente
│   └── casos.json              # 📋 Pendiente
│
├── lib/
│   ├── tokens.js               # ✅ Design tokens — paleta verde en HSL
│   └── mail.js                 # ✅ sendContactEmail() con Resend
│
├── docs/                       # Documentación del proyecto
│   ├── SPRINTS.md
│   ├── PRODUCT_BACKLOG.md
│   ├── ARQUITECTURA.md         # Este archivo
│   ├── como-esta-hecha-la-web.md
│   └── brand/                  # Activos e historial visual de marca (uso interno)
│       ├── Logo-ComplexIA.png         # Guía visual original
│       ├── isotipo.svg                # Versión final del isotipo
│       ├── wordmark-tagline.png       # Mockup wordmark (Gemini)
│       ├── prompts-graficos.md        # Prompts para regenerar activos
│       └── iteraciones/               # PNGs intermedios descartados
│
└── public/
    └── images/
```

---

## Rutas de la Aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| / | Público | Landing page (scroll único) |
| /servicios/[slug] | Público | Detalle de servicio (pendiente) |
| /casos/[slug] | Público | Caso de éxito detallado (pendiente) |
| /blog | Público | Índice del blog (pendiente) |
| /blog/[slug] | Público | Artículo individual (pendiente) |
| /legal/aviso-legal | Público | Aviso legal (placeholder "En redacción") |
| /legal/privacidad | Público | Política de privacidad (placeholder) |
| /legal/cookies | Público | Política de cookies (placeholder) |
| /api/contacto | API interna | POST: valida + consentimiento RGPD + envía email |

---

## Secciones de la Landing — Orden

```
<Navbar />            ✅ hecho
<main>
  <Hero />            ✅ H1, subtítulo, CTAs, stats bar
  <Servicios />       ✅ id="servicios"
  <Metodologia />     ✅ id="metodologia"
  <Casos />           ✅ id="casos" — caso La Impecable con enlace al dominio
  <Contacto />        ✅ id="contacto" — formulario + consentimiento RGPD
</main>
<Footer />            ✅ marca + navegación + información legal
```

> La sección Nosotros fue descartada. Queda un enlace muerto a `#nosotros` en `Navbar.jsx` pendiente de limpiar.

---

## Sistema de Diseño

### Paleta verde (H=145 S=46.7%) — definida en globals.css con @theme

| Clase Tailwind | HSL | Uso principal |
|---|---|---|
| `green-950` | hsl(145, 46.7%, 10%) | Títulos principales |
| `green-900` | hsl(145, 46.7%, 15%) | Fondos oscuros (stats bar) |
| `green-800` | hsl(145, 46.7%, 22%) | Texto secundario, hover |
| `green-700` | hsl(145, 46.7%, 33.1%) | **Color de marca** — botones, enlaces |
| `green-300` | hsl(145, 46.7%, 70%) | Texto sobre fondos oscuros |
| `green-100` | hsl(145, 46.7%, 90%) | Fondos de pills, bordes |
| `green-50` | hsl(145, 46.7%, 97%) | Fondos de secciones alternas |

### Tipografía
- **Instrument Sans** — única fuente, cargada con `next/font/google` como variable CSS `--font-instrument-sans`
- Pesos disponibles: 400, 500, 600, 700
- Configurada en `@theme` como `--font-sans`

### Espaciado y layout
- Contenedor: `max-w-7xl mx-auto`
- Padding horizontal: `px-4 sm:px-6 lg:px-8`

### Identidad de marca (isotipo + wordmark)

| Sitio | Cómo se renderiza |
|---|---|
| Favicon (pestaña navegador) | `app/icon.svg` — SVG monocromo en `#2E7B4D` |
| Navbar | `<Isotipo>` `h-9` en `text-green-700` + wordmark texto "ComplexIA" envuelto en un único `<span>` |
| Footer | `<Isotipo>` `h-9` en `text-green-400` + wordmark texto sobre `bg-green-950` |
| Hero | `<Isotipo>` `h-[450px]` en `text-green-100` como decoración de fondo a la derecha (solo `xl+`) |

El componente `components/ui/Isotipo.jsx` usa `fill="currentColor"` para que el color se controle desde el padre con clases Tailwind (`text-green-*`).

El wordmark se mantiene como **texto puro** (no SVG) para conservar SEO y accesibilidad — Google indexa "ComplexIA" como string.

---

## Open Graph image (compartir en redes)

`app/opengraph-image.jsx` la genera dinámicamente con **next/og** (motor Satori):

- Tamaño 1200×630, fondo `green-950`, wordmark a la izquierda con "IA" destacado en `#88CCA5`, tagline en mayúsculas espaciadas.
- Las fuentes se cargan desde Google Fonts en **TTF** — Satori no soporta WOFF2, así que `fetch` al CSS de Google **sin User-Agent moderno** para que devuelva TTF.
- `app/layout.jsx` define `metadataBase: new URL('https://complexia.es')` y un bloque `openGraph` con `siteName`, `locale: es_ES`. Next.js asocia automáticamente la imagen generada.

---

## Flujo del Formulario de Contacto

```
Usuario rellena Contacto.jsx ('use client')
      ↓
Marca el checkbox de consentimiento RGPD (botón Enviar deshabilitado si no)
      ↓
fetch POST /api/contacto  (incluye consentimiento: true)
      ↓
app/api/contacto/route.js — valida campos + rechaza 400 si consentimiento !== true
      ↓
lib/mail.js — sendContactEmail() con Resend SDK
      ↓
Email llega a la bandeja de ComplexIA
```

Variable de entorno necesaria: `RESEND_API_KEY` (en `.env.local` para local, en Vercel para producción).
La política de privacidad enlazada desde el checkbox vive en `/legal/privacidad` (placeholder hasta redactar el texto definitivo).

---

## Convenciones

### Componentes
- Un componente por archivo, PascalCase, extensión `.jsx`
- `'use client'` solo cuando usa hooks o eventos del browser
- Secciones → `components/sections/` | Primitivos → `components/ui/`

### Estilos
- Solo clases Tailwind — ni CSS inline ni módulos CSS
- Solo la paleta verde personalizada — no usar colores Tailwind por defecto

### Importaciones
- Alias `@/` apunta a la raíz de `complexia-web/`
- Orden: librerías externas → componentes internos → lib

---

## Reglas Inamovibles

1. **Sin TypeScript** — el proyecto es JSX puro
2. **Sin librerías UI externas** — no Radix, no shadcn, construir a mano
3. **Sin CSS-in-JS** — solo Tailwind
4. **Sin animaciones con Framer Motion** — hasta que esté acordado
5. **No abstraer prematuramente** — tres secciones similares no necesitan un componente genérico

---

## CI/CD

La rama `main` se despliega automáticamente en Vercel.
Variables de entorno de producción configuradas en el panel de Vercel.
