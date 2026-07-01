# Stack Tecnológico — ComplexIA
*Traído y actualizado desde `la-impecable/docs/STACK_TECNOLOGICO.md` el 1 Julio 2026. Explicación en lenguaje llano para referencia rápida — para el detalle técnico completo ver `ARQUITECTURA.md`.*

## Lenguajes

### JavaScript
El único lenguaje de programación del proyecto. Corre tanto en el navegador (botones, formularios, interactividad) como en el servidor (lógica de negocio, conexión a base de datos). No usamos TypeScript para mantenerlo simple.

### HTML / CSS (implícitos)
No se escriben directamente. React genera el HTML y Tailwind genera el CSS automáticamente a partir de las clases en el código.

### SQL
Define la estructura de la base de datos (tablas, columnas, relaciones). Es PostgreSQL estándar, gestionado por Supabase. ⚠️ El histórico de migraciones `.sql` vive hoy solo en el repo legacy `la-impecable` — ver `ARQUITECTURA.md`, sección "Deuda de infraestructura".

---

## Frameworks y librerías principales

### Next.js 16
El corazón del proyecto. Aporta:
- **App Router** — sistema de páginas y rutas (cada carpeta en `src/app/` es una URL)
- **Server Components** — partes de la web renderizadas en el servidor, más rápidas y seguras
- **Server Actions** — funciones que corren en el servidor pero se llaman desde el navegador
- **API Routes** — endpoints como `/api/webhooks/stripe` o `/api/slots`

### React 19
Todo lo que el usuario ve es un componente React — botones, modales, tablas, formularios.

### Tailwind CSS 4
En vez de escribir CSS separado, se escriben clases directamente en el HTML (`bg-blue-500`, `flex`, `rounded-lg`). Genera solo el CSS que realmente se usa.

### Lucide React
Librería de iconos. Todos los iconos del panel de admin y del portal empleado/cliente. Sustituyó a Heroicons (que sigue usándose solo en la parte de consultoría, `components/ui/` y `components/sections/`).

### pdf-lib
Genera PDFs directamente en el servidor, sin dependencias externas. Facturas y nóminas.

### next-themes
Modo claro/oscuro. Paletas en `globals.css` como variables HSL.

### Recharts
Gráficas declarativas (líneas, barras, barras apiladas). `/admin/contabilidad/analytics`.

### @anthropic-ai/sdk
SDK oficial de Claude. OCR de facturas y albaranes de proveedores: el admin sube una foto o PDF, Claude Vision extrae fecha, importe, IVA, descripción y proveedor, y pre-rellena el formulario de gastos.

### nodemailer
Envío de emails del formulario de contacto de la parte de consultoría (`/api/contacto`). Sistema **distinto** del de Resend (usado para los emails transaccionales del SaaS: reservas, nóminas, etc.).

---

## Servicios externos

### Supabase
Base de datos y autenticación. Proyecto renombrado el 30/06/2026 de "la-impecable" a **"SaaS ComplexIA"**. Aporta:
- **PostgreSQL** — clientes, empleados, reservas, nóminas, negocios (multi-tenant), etc.
- **Auth** — login/logout, OAuth con Google, magic links por email
- **Row Level Security (RLS)** — cada usuario solo ve los datos de su negocio (`business_id`)
- **Storage** — PDFs de nóminas, archivos de gastos

### Stripe
Pagos online de reservas. Webhooks en `/api/webhooks/stripe`. Modo test todavía, no live. La facturación recurrente del propio SaaS (cobrar a los tenants) está en backlog (F9-13).

### Resend
Emails transaccionales del SaaS: confirmaciones de reserva, notificaciones a empleados, nóminas.

### Vercel
Plataforma de deploy. Cada `git push` a `main` lanza un deploy automático. Gestiona variables de entorno.

---

## Herramientas de desarrollo

### Git + GitHub
Repo activo: `github.com/dsm0033/complexia-web`. Repo legacy (no tocar): `github.com/dsm0033/la-impecable`.

### ESLint
Analizador de código, flat config (`eslint.config.mjs`).

### Vitest
Framework de tests unitarios. **Instalado pero no conectado en este repo** — faltan `vitest.config` y el script `test` en `package.json`. Los archivos `*.test.js` se copiaron en la migración pero no se ejecutan hoy. Ver `ARQUITECTURA.md`.

### Claude Code
Herramienta de desarrollo con IA integrada directamente en el flujo de trabajo — lee, escribe y modifica el código del proyecto.
