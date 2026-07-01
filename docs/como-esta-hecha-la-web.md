# Cómo está hecha la web de ComplexIA

> ⚠️ **Nota (1 Julio 2026):** este documento describe únicamente la parte de **consultoría** de la web
> (landing en `/`, formulario de contacto) tal como era antes de la migración SaaS del Sprint 12. Sigue
> siendo correcto para esa parte, pero el proyecto ahora es mucho más grande: incluye una plataforma
> SaaS multi-tenant completa (Supabase, Stripe, paneles admin/empleado/cliente). Para el estado real y
> completo del proyecto, ver `ARQUITECTURA.md` en esta misma carpeta. Este documento se conserva como
> introducción sencilla a los conceptos base de Next.js/Tailwind, útil para quien empieza.

## La tecnología: Next.js

Usamos **Next.js**, un framework que junta frontend y backend en el mismo proyecto. Por eso no hay dos carpetas separadas — es intencionado.

---

## Frontend vs Backend en este proyecto

### Frontend — lo que el usuario ve
Son los archivos `.jsx` dentro de `components/` y `app/`.

```
components/
  ui/Navbar.jsx        ← barra de navegación
  sections/Hero.jsx    ← sección hero con stats
app/
  page.jsx             ← página principal (junta las secciones)
  layout.jsx           ← estructura HTML base (fuente, metadata)
```

Esto se convierte en HTML + CSS + JavaScript que el navegador renderiza. El usuario lo ve directamente.

### Backend — lógica del servidor
Son los archivos `route.js` dentro de `app/api/`.

```
app/
  api/
    contacto/route.js  ← recibe el formulario y envía el email
```

Esto nunca llega al navegador. Solo se ejecuta en el servidor. Aquí conectaremos con Resend para enviar emails.

---

## Los estilos: Tailwind CSS

No hay un archivo CSS por componente. Los estilos se escriben directamente en el JSX como clases:

```jsx
<h1 className="text-5xl font-bold text-green-950">
  Simplificando lo complejo.
</h1>
```

`text-5xl` = tamaño de fuente, `font-bold` = negrita, `text-green-950` = color verde oscuro. Tailwind genera solo el CSS que se usa, nada más.

---

## El flujo completo de una petición

```
Usuario abre la web
      ↓
Next.js genera el HTML en el servidor (rápido, bueno para SEO)
      ↓
El navegador recibe el HTML ya renderizado
      ↓
React "hidrata" la página (añade interactividad: menú móvil, formulario…)
      ↓
Usuario rellena contacto y envía
      ↓
Petición POST → app/api/contacto/route.js (backend)
      ↓
El servidor llama a Resend → te llega el email
```

---

## Estructura final del proyecto

```
complexia-web/
├── app/               ← RUTAS (cada carpeta = una URL)
│   ├── page.jsx       → localhost:3000/
│   ├── blog/
│   │   └── page.jsx   → localhost:3000/blog
│   └── api/
│       └── contacto/
│           └── route.js  → POST localhost:3000/api/contacto
│
├── components/        ← PIEZAS reutilizables (no son rutas)
│   ├── ui/            → Navbar, Footer, Button…
│   └── sections/      → Hero, Servicios, Contacto…
│
└── lib/               ← UTILIDADES (lógica compartida)
    ├── tokens.js      → colores del diseño
    └── mail.js        → función para enviar email
```
