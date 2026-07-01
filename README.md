# ComplexIA

Plataforma **SaaS multi-tenant** para PYMEs del sector servicios (reservas, empleados, facturación,
nóminas), con la web de consultoría de IA de ComplexIA conviviendo como landing en `/`.

La Impecable (estética de vehículos) es el primer tenant (`slug = 'la-impecable'`), migrado a este
repo en el Sprint 12 desde su repo original (`la-impecable`, ahora legacy — no se toca).

**Documentación completa:** ver `docs/ARQUITECTURA.md` (estado real y actualizado), `docs/SPRINTS.md`
y `docs/PRODUCT_BACKLOG.md`.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Lenguaje | JavaScript / JSX — sin TypeScript |
| Estilos | Tailwind CSS v4 |
| Iconos | Lucide React (consultoría: Heroicons) |
| Base de datos | Supabase (Postgres + Auth + RLS multi-tenant) |
| Pagos | Stripe |
| Email SaaS | Resend · Email consultoría (`/api/contacto`): Nodemailer/SMTP SERED |
| Observabilidad | Sentry |
| Tests | Vitest (`npm test`) — 80 tests unitarios en `src/lib/` |
| Deploy | Vercel |

---

## Estructura de carpetas

```
complexia-web/
├── src/
│   ├── app/
│   │   ├── page.jsx             # Landing (hoy: consultoría; plan: landing SaaS)
│   │   ├── login/ · auth/ · superadmin/
│   │   └── app/[slug]/          # Rutas del tenant (público, admin, empleado, cliente)
│   ├── components/
│   ├── lib/                     # Lógica pura + clientes Supabase/Stripe
│   └── proxy.js                 # Next 16: nunca middleware.js
├── supabase/migrations/         # Histórico de esquema SQL
├── docs/                        # Documentación viva del proyecto
└── vercel.json                  # Cron de recordatorios
```

Detalle completo en `docs/ARQUITECTURA.md`.

---

## Comandos

```bash
npm install
npm run dev      # localhost:3000
npm run build
npm run start
npm run lint
npm test          # Vitest — tests unitarios de src/lib/
npm run test:watch
```

---

## Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
ANTHROPIC_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GA_ID=
SMTP_PASS=           # ⚠️ falta en .env.local — necesaria para /api/contacto (formulario de consultoría)
```

---

## Qué NO hacer

Ver `CLAUDE.md` — resumen: sin TypeScript, sin `middleware.js` (usar `src/proxy.js`), sin `LIMIT 1`
para resolver `business_id` (siempre por `slug`), sin Heroicons en el SaaS (Lucide), sin
`service_role` fuera de webhooks/cron/auth-callback.
