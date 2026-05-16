# SPRINTS — COMPLEXIA
*Última actualización: 16 Mayo 2026*

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
| Footer | 📋 |

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
| Footer | 📋 Próxima sesión |

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
