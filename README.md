# ComplexIA — Web Corporativa

Plataforma web de **ComplexIA**, consultoría de inteligencia artificial para PYMEs españolas. Ayuda a pequeñas y medianas empresas a dar el salto digital con soluciones de IA accesibles, personalizadas y orientadas a resultados.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | JavaScript / JSX |
| Estilos | Tailwind CSS v3 con paleta verde personalizada |
| Iconos | Heroicons v2 |
| Email | Resend (formulario de contacto) |
| Font | Inter (Google Fonts vía `next/font`) |
| Deploy | Vercel (previsto) |

---

## Arquitectura de carpetas

```
complexia-web/
├── app/                        # Rutas (Next.js App Router)
│   ├── layout.jsx              # Root layout global
│   ├── page.jsx                # Landing page (one-page scroll)
│   ├── blog/
│   │   ├── page.jsx            # Índice del blog
│   │   └── [slug]/page.jsx     # Artículo individual
│   ├── servicios/
│   │   └── [slug]/page.jsx     # Página de detalle de servicio
│   ├── casos/
│   │   └── [slug]/page.jsx     # Caso de éxito detallado
│   └── api/
│       └── contacto/route.js   # Endpoint de envío de email (Resend)
│
├── components/
│   ├── ui/                     # Primitivos reutilizables (Navbar, Footer, Button…)
│   └── sections/               # Secciones de la landing (Hero, Servicios, Contacto…)
│
├── content/                    # Contenido estático en JSON/MDX
│   ├── blog/
│   ├── servicios/
│   └── casos/
│
├── lib/
│   ├── tokens.js               # Design tokens (paleta verde HSL)
│   └── mail.js                 # Wrapper Resend
│
└── public/
    └── images/                 # Assets estáticos
```

---

## Secciones de la landing

| Sección | ID | Estado |
|---|---|---|
| Navbar | — | Hecho |
| Hero + stats | `#hero` | Hecho |
| Servicios | `#servicios` | Pendiente |
| Metodología | `#metodologia` | Pendiente |
| Casos de éxito | `#casos` | Pendiente |
| Nosotros | `#nosotros` | Pendiente |
| Contacto | `#contacto` | Pendiente |
| Footer | — | Pendiente |

---

## Páginas adicionales previstas

- `/blog` — Artículos sobre IA para PYMEs
- `/servicios/[slug]` — Detalle de cada servicio ofrecido
- `/casos/[slug]` — Casos de éxito con métricas reales

---

## Sistema de diseño

Paleta monocromática verde personalizada (H=145 S=46.7%) definida en `lib/tokens.js` y registrada en `tailwind.config.js`.

| Token | Uso principal |
|---|---|
| `green-700` | Botones primarios, enlaces activos |
| `green-800` | Hover de botones, texto secundario |
| `green-900` | Stats bar, fondos oscuros |
| `green-950` | Títulos principales |
| `green-100` | Fondos suaves, pills |
| `green-50` | Fondo de secciones alternadas |

---

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Arrancar producción local
npm run start

# Lint
npm run lint
```

---

## Formulario de contacto

El formulario en `#contacto` envía un email mediante **Resend** a través de `app/api/contacto/route.js`. Requiere la variable de entorno:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Crear un archivo `.env.local` en la raíz de `complexia-web/` con esa clave antes de usar el formulario en local.
