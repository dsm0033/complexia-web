# SPRINTS — COMPLEXIA
*Última actualización: 19 Mayo 2026*

## Metodología
- Sprints de 1-2 semanas
- Equipo: Diego (Product Owner + Developer) + Claude (Tech Lead + Mentor)
- Definition of Done: funciona + probado + commit + push + Diego lo entiende

---

## ✅ SPRINT 0 — "Arranque"
**Fecha:** 15 Mayo 2026
**Objetivo:** Proyecto en marcha con stack definido y componentes base
**Estado:** COMPLETADO

| Tarea | Estado |
|---|---|
| Proyecto Next.js creado con create-next-app | ✅ |
| Estructura de carpetas definida (components/ui, components/sections, lib, content) | ✅ |
| Navbar responsive con menú móvil y hamburguesa | ✅ |
| Hero section con H1, subtítulo, CTAs y stats bar | ✅ |
| Design tokens — paleta verde personalizada (H=145 S=46.7%) | ✅ |
| Tailwind CSS configurado con paleta propia | ✅ |
| README.md con arquitectura y stack | ✅ |
| CLAUDE.md con guía para Claude | ✅ |
| docs/ con explicación técnica del proyecto | ✅ |

---

## ✅ SPRINT 1 — "Stack y Calidad"
**Fecha:** 15 Mayo 2026
**Objetivo:** Stack actualizado a versiones latest + accesibilidad base WCAG 2.1
**Estado:** COMPLETADO

| Tarea | Estado |
|---|---|
| Next.js 14 → 16.2.3 | ✅ |
| React 18 → 19.2.4 | ✅ |
| Tailwind v3 → v4.3.0 (tailwind.config.js eliminado, @theme en globals.css) | ✅ |
| ESLint 8 → 9 (flat config, .eslintrc.json eliminado) | ✅ |
| postcss.config.mjs migrado a @tailwindcss/postcss | ✅ |
| Skip-to-content link en layout | ✅ |
| `<main id="main-content">` como landmark semántico | ✅ |
| `aria-expanded`, `aria-controls`, `aria-label` en Navbar | ✅ |
| `aria-label` en sección Hero | ✅ |
| `:focus-visible` global para navegación por teclado | ✅ |
| Stats bar actualizada con propuesta de valor (cliente-céntrico) | ✅ |
| H1 simplificado — eliminado "Con inteligencia artificial" | ✅ |
| CTA botón full-width en móvil | ✅ |

---

## ✅ SPRINT 2 — "Presencia Online"
**Fecha:** 15 Mayo 2026
**Objetivo:** Repositorio en GitHub + deploy en Vercel + dominio
**Estado:** COMPLETADO

| Tarea | Estado |
|---|---|
| Repositorio GitHub creado (github.com/dsm0033/complexia-web) | ✅ |
| .gitignore correcto | ✅ |
| Primer commit y push | ✅ |
| Deploy en Vercel | ✅ |
| Dominio complexia.es conectado (nameservers de Vercel) | ✅ |
| www.complexia.es con redirección 307 | ✅ |
| SSL automático generado por Vercel | ✅ |
| Favicon personalizado | 📋 |
| og-image 1200×630px | 📋 |
| SEO: metadata completa, Open Graph, canonical | 📋 |

---

## ✅ SPRINT 3 — "Landing Completa"
**Fecha:** 16 Mayo 2026
**Objetivo:** Todas las secciones de la landing construidas
**Estado:** COMPLETADO (email pendiente de configuración externa)

| Tarea | Estado |
|---|---|
| Sección Servicios (#servicios) | ✅ |
| Sección Metodología (#metodologia) | ✅ |
| Sección Casos de éxito (#casos) — caso La Impecable | ✅ |
| Sección Nosotros (#nosotros) | ❌ Descartada por el usuario |
| Sección Contacto (#contacto) — formulario completo | ✅ |
| lib/mail.js — sendContactEmail() con Resend | ✅ |
| app/api/contacto/route.js — endpoint POST con validación | ✅ |
| Resend instalado como dependencia | ✅ |
| Footer | ✅ (Sprint 4.1) |

---

## 🔄 SPRINT 4 — "Email y Despliegue"
**Objetivo:** Email operativo + documento de despliegue SERED+Vercel replicable
**Estado:** EN PROGRESO — bloqueado por SERED

| Tarea | Estado |
|---|---|
| Ticket a SERED para asociar complexia.es a cPanel | 📋 Pendiente (abrir antes de la próxima sesión) |
| Crear buzón contacto@complexia.es en SERED | 📋 Bloqueado |
| Añadir MX records en Vercel DNS (ya hecho: MX + A mail) | ✅ |
| Verificar dominio complexia.es en Resend | 📋 Bloqueado |
| RESEND_API_KEY en variables de entorno Vercel | 📋 Pendiente |
| Test de envío en producción | 📋 Pendiente |
| Documento de despliegue SERED+Vercel replicable | 📋 Próxima sesión |

---

## ✅ SPRINT 4.1 — "Marca, Footer y RGPD"
**Fecha:** 17 Mayo 2026
**Objetivo:** Cerrar la identidad de marca, dar la web su Footer y dejar el formulario conforme a RGPD.
**Estado:** COMPLETADO

| Tarea | Estado |
|---|---|
| Tipografía cambiada Inter → Instrument Sans (pesos 400/500/600/700) | ✅ |
| Guía visual de marca guardada en `docs/brand/Logo-ComplexIA.png` | ✅ |
| Enlace al dominio real `laimpecable.es` desde el caso de éxito | ✅ |
| Footer en `components/ui/Footer.jsx` (marca + navegación + legal) | ✅ |
| Rutas `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies` (placeholders) | ✅ |
| Layout compartido para `/legal/*` con Navbar + Footer | ✅ |
| Checkbox de consentimiento RGPD obligatorio en el formulario de contacto | ✅ |
| Validación servidor: 400 si `consentimiento !== true` | ✅ |
| Email unificado a `contacto@complexia.es` en sección Contacto | ✅ |
| Teléfono placeholder `+34 600 000 000` eliminado | ✅ |
| Limpieza: `package-lock.json` huérfano de la raíz + dev server fantasma | ✅ |
| Decisión pendiente: tipografía oficial Satoshi vs Instrument Sans | 📋 |
| Enlace muerto a `#nosotros` en Navbar | 📋 |

---

## ✅ SPRINT 4.2 — "Identidad gráfica y SEO base"
**Fecha:** 18-19 Mayo 2026
**Objetivo:** Convertir la identidad visual de la marca en activos integrados en la web y dejar la base de SEO/Open Graph lista.
**Estado:** COMPLETADO

| Tarea | Estado |
|---|---|
| Favicon SVG con isotipo (`app/icon.svg` en green-700) | ✅ |
| Componente `Isotipo.jsx` reutilizable con `fill="currentColor"` | ✅ |
| Isotipo integrado en Navbar (`text-green-700`) | ✅ |
| Isotipo integrado en Footer (`text-green-400` sobre fondo green-950) | ✅ |
| Isotipo decorativo gigante de fondo en Hero (`text-green-100`, sólo `xl+`) | ✅ |
| Wordmark "ComplexIA" pegado (span único) en Navbar y Footer | ✅ |
| Open Graph image 1200×630 con `next/og` y Satori | ✅ |
| Metadata SEO enriquecida (metadataBase, title, description, openGraph, locale) | ✅ |
| Activos archivados en `docs/brand/` (isotipo final + iteraciones + wordmark mockup) | ✅ |
| Prompts para regenerar activos (`docs/brand/prompts-graficos.md`) | ✅ |
| Apple touch icon 180×180 | 📋 Pendiente |
| Wordmark SVG completo (no necesario; el wordmark vive como texto por SEO) | ❌ Descartado |
| Canonical y robots metadata | 📋 Pendiente (F1-13) |

---

## 📋 SPRINT 5 — "Páginas Interiores"
**Objetivo:** Blog, servicios detalle y casos de éxito

| Tarea | Estado |
|---|---|
| content/servicios.json — datos de servicios | 📋 |
| content/casos.json — casos de éxito | 📋 |
| /servicios/[slug] — página de detalle de servicio | 📋 |
| /casos/[slug] — página de caso de éxito detallado | 📋 |
| /blog — índice de artículos | 📋 |
| /blog/[slug] — artículo individual | 📋 |
