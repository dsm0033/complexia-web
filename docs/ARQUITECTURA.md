# ARQUITECTURA TÉCNICA — COMPLEXIA
*Última actualización: 15 Mayo 2026*

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
│   ├── layout.jsx              # Root layout: fuente, metadata, skip-link
│   ├── page.jsx                # Landing — importa secciones en orden
│   ├── blog/
│   │   ├── page.jsx            # Índice del blog
│   │   └── [slug]/page.jsx     # Artículo individual
│   ├── servicios/
│   │   └── [slug]/page.jsx     # Detalle de servicio
│   ├── casos/
│   │   └── [slug]/page.jsx     # Caso de éxito detallado
│   └── api/
│       └── contacto/route.js   # POST: recibe formulario, envía email con Resend
│
├── components/
│   ├── ui/                     # Primitivos reutilizables en toda la app
│   │   ├── Navbar.jsx          # ✅ Sticky, responsive, 'use client'
│   │   ├── Footer.jsx          # Pendiente
│   │   └── Button.jsx          # Pendiente — variantes: primary / ghost
│   └── sections/               # Secciones de la landing únicamente
│       ├── Hero.jsx            # ✅ H1 + subtitle + CTAs + stats bar
│       ├── Servicios.jsx       # Pendiente
│       ├── Metodologia.jsx     # Pendiente
│       ├── Casos.jsx           # Pendiente (preview — detalle en /casos/[slug])
│       ├── Nosotros.jsx        # Pendiente
│       └── Contacto.jsx        # Pendiente — formulario + POST a /api/contacto
│
├── content/                    # Datos estáticos en JSON (sin CMS)
│   ├── servicios.json          # Pendiente
│   └── casos.json              # Pendiente
│
├── lib/
│   ├── tokens.js               # Design tokens — paleta verde en HSL
│   └── mail.js                 # Pendiente — sendContactEmail() con Resend
│
├── docs/                       # Documentación del proyecto
│   ├── SPRINTS.md
│   ├── PRODUCT_BACKLOG.md
│   ├── ARQUITECTURA.md         # Este archivo
│   └── como-esta-hecha-la-web.md
│
└── public/
    └── images/
```

---

## Rutas de la Aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| / | Público | Landing page (scroll único) |
| /servicios/[slug] | Público | Detalle de servicio |
| /casos/[slug] | Público | Caso de éxito detallado |
| /blog | Público | Índice del blog |
| /blog/[slug] | Público | Artículo individual |
| /api/contacto | API interna | POST: recibe formulario y envía email |

---

## Secciones de la Landing — Orden

```
<Navbar />            ✅ hecho
<main>
  <Hero />            ✅ hecho — H1, subtítulo, CTAs, stats bar
  <Servicios />       📋 pendiente — id="servicios"
  <Metodologia />     📋 pendiente — id="metodologia"
  <Casos />           📋 pendiente — id="casos"
  <Nosotros />        📋 pendiente — id="nosotros"
  <Contacto />        📋 pendiente — id="contacto"
</main>
<Footer />            📋 pendiente
```

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

---

## Flujo del Formulario de Contacto

```
Usuario rellena Contacto.jsx ('use client')
      ↓
fetch POST /api/contacto
      ↓
app/api/contacto/route.js — valida campos
      ↓
lib/mail.js — sendContactEmail() con Resend SDK
      ↓
Email llega a la bandeja de ComplexIA
```

Variable de entorno necesaria: `RESEND_API_KEY` (en `.env.local` para local, en Vercel para producción)

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
