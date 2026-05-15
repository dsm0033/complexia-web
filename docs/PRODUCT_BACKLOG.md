# PRODUCT BACKLOG — COMPLEXIA
*Última actualización: 15 Mayo 2026*

## Estado del Proyecto
- **Web:** pendiente de deploy
- **Stack:** Next.js 16 + Tailwind CSS v4 + Vercel
- **Objetivo:** Web corporativa que genera leads para la consultoría ComplexIA

---

## FASE 1 — Fundaciones y Presencia

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F1-01 | Proyecto Next.js creado | 🔴 | ✅ |
| F1-02 | Estructura de carpetas definida | 🔴 | ✅ |
| F1-03 | Navbar responsive con menú móvil | 🔴 | ✅ |
| F1-04 | Hero section con CTAs y stats bar | 🔴 | ✅ |
| F1-05 | Design tokens — paleta verde personalizada | 🔴 | ✅ |
| F1-06 | Stack actualizado (Next.js 16, React 19, Tailwind v4) | 🔴 | ✅ |
| F1-07 | Accesibilidad WCAG 2.1 AA base | 🟡 | ✅ |
| F1-08 | Repositorio GitHub | 🔴 | 📋 |
| F1-09 | Deploy en Vercel | 🔴 | 📋 |
| F1-10 | Dominio conectado | 🔴 | 📋 |
| F1-11 | Favicon personalizado con logo ComplexIA | 🟡 | 📋 |
| F1-12 | og-image 1200×630px | 🟡 | 📋 |
| F1-13 | SEO completo (Open Graph, canonical, robots, metadata) | 🟡 | 📋 |

---

## FASE 2 — Landing Page Completa

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F2-01 | Sección Servicios (#servicios) | 🔴 | 📋 |
| F2-02 | Sección Metodología (#metodologia) | 🟡 | 📋 |
| F2-03 | Sección Casos de éxito (#casos) — preview | 🟡 | 📋 |
| F2-04 | Sección Nosotros (#nosotros) | 🟡 | 📋 |
| F2-05 | Sección Contacto (#contacto) con formulario | 🔴 | 📋 |
| F2-06 | Footer con links, redes sociales y aviso legal | 🟡 | 📋 |
| F2-07 | Animaciones de scroll suaves (sin Framer Motion) | 🟢 | 📋 |

---

## FASE 3 — Formulario de Contacto y Email

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F3-01 | lib/mail.js — función sendContactEmail() con Resend | 🔴 | 📋 |
| F3-02 | app/api/contacto/route.js — endpoint POST | 🔴 | 📋 |
| F3-03 | Componente Contacto.jsx — formulario con validación | 🔴 | 📋 |
| F3-04 | RESEND_API_KEY en variables de entorno Vercel | 🔴 | 📋 |
| F3-05 | Email de confirmación al lead | 🟡 | 📋 |
| F3-06 | Protección anti-spam (honeypot o rate limiting) | 🟡 | 📋 |

---

## FASE 4 — Páginas Interiores

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F4-01 | content/servicios.json — datos de servicios | 🔴 | 📋 |
| F4-02 | /servicios/[slug] — página de detalle | 🔴 | 📋 |
| F4-03 | content/casos.json — casos de éxito | 🟡 | 📋 |
| F4-04 | /casos/[slug] — caso de éxito detallado con métricas | 🟡 | 📋 |
| F4-05 | /blog — índice de artículos | 🟢 | 📋 |
| F4-06 | /blog/[slug] — artículo individual | 🟢 | 📋 |

---

## FASE 5 — Legal y Confianza

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F5-01 | /aviso-legal | 🔴 | 📋 |
| F5-02 | /privacidad | 🔴 | 📋 |
| F5-03 | /cookies | 🟡 | 📋 |
| F5-04 | Banner de cookies | 🟡 | 📋 |
| F5-05 | Google Analytics (GA4) | 🟢 | 📋 |

---

## FASE X — Calidad e Infraestructura

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| FX-01 | Lighthouse score > 90 en todas las categorías | 🟡 | 📋 |
| FX-02 | Accesibilidad WCAG 2.1 AAA completa | 🟢 | 📋 |
| FX-03 | Tests E2E del formulario de contacto | 🟢 | 📋 |

---

## Prioridades
- 🔴 Crítica — bloquea otras tareas
- 🟡 Alta — importante pero no bloquea
- 🟢 Media — mejora sin urgencia

## Estados
- ✅ Completado
- 🔄 En progreso
- 📋 Pendiente
