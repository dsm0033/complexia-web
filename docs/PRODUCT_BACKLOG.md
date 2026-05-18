# PRODUCT BACKLOG — COMPLEXIA
*Última actualización: 17 Mayo 2026*

## Estado del Proyecto
- **Web en vivo:** complexia.es
- **Repositorio:** github.com/dsm0033/complexia-web
- **Stack:** Next.js 16 + React 19 + Tailwind CSS v4 + Vercel
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
| F1-08 | Repositorio GitHub (github.com/dsm0033/complexia-web) | 🔴 | ✅ |
| F1-09 | Deploy en Vercel | 🔴 | ✅ |
| F1-10 | Dominio complexia.es conectado con SSL (nameservers Vercel) | 🔴 | ✅ |
| F1-11 | Favicon personalizado con logo ComplexIA | 🟡 | ✅ |
| F1-12 | og-image 1200×630px | 🟡 | 📋 |
| F1-13 | SEO completo (Open Graph, canonical, robots, metadata) | 🟡 | 📋 |

---

## FASE 2 — Landing Page Completa

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F2-01 | Sección Servicios (#servicios) | 🔴 | ✅ |
| F2-02 | Sección Metodología (#metodologia) | 🟡 | ✅ |
| F2-03 | Sección Casos de éxito (#casos) — caso La Impecable | 🟡 | ✅ |
| F2-04 | Sección Nosotros (#nosotros) | 🟡 | ❌ Descartada |
| F2-05 | Sección Contacto (#contacto) con formulario | 🔴 | ✅ |
| F2-06 | Footer con navegación, contacto y enlaces legales | 🟡 | ✅ |
| F2-07 | Animaciones de scroll suaves (sin Framer Motion) | 🟢 | 📋 |

---

## FASE 3 — Formulario de Contacto y Email

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| F3-01 | lib/mail.js — función sendContactEmail() con Resend | 🔴 | ✅ |
| F3-02 | app/api/contacto/route.js — endpoint POST | 🔴 | ✅ |
| F3-03 | Componente Contacto.jsx — formulario con validación | 🔴 | ✅ |
| F3-04 | Buzón contacto@complexia.es en SERED | 🔴 | 📋 Bloqueado — ticket a SERED |
| F3-05 | Dominio complexia.es verificado en Resend | 🔴 | 📋 Bloqueado |
| F3-06 | RESEND_API_KEY en variables de entorno Vercel | 🔴 | 📋 Pendiente |
| F3-07 | Test de envío en producción | 🔴 | 📋 Pendiente |
| F3-08 | Email de confirmación al lead | 🟡 | 📋 |
| F3-09 | Protección anti-spam (honeypot o rate limiting) | 🟡 | 📋 |

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
| F5-01 | Ruta /legal/aviso-legal — placeholder "En redacción" | 🔴 | ✅ |
| F5-02 | Ruta /legal/privacidad — placeholder "En redacción" | 🔴 | ✅ |
| F5-03 | Ruta /legal/cookies — placeholder "En redacción" | 🟡 | ✅ |
| F5-04 | Redactar texto real de aviso legal (LSSI art. 10) | 🔴 | 📋 |
| F5-05 | Redactar texto real de política de privacidad (RGPD/LOPDGDD) | 🔴 | 📋 |
| F5-06 | Redactar texto real de política de cookies | 🟡 | 📋 |
| F5-07 | Checkbox de consentimiento RGPD en formulario de contacto | 🔴 | ✅ |
| F5-08 | Integrar analytics (Vercel Analytics o GA4) | 🟡 | 📋 |
| F5-09 | Banner de consentimiento de cookies (bloquea analytics hasta aceptar) | 🟡 | 📋 |

---

## FASE X — Calidad e Infraestructura

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| FX-01 | Documento de despliegue SERED+Vercel replicable | 🔴 | 📋 Próxima sesión |
| FX-02 | Lighthouse score > 90 en todas las categorías | 🟡 | 📋 |
| FX-03 | Accesibilidad WCAG 2.1 AAA completa | 🟢 | 📋 |
| FX-04 | Tests E2E del formulario de contacto | 🟢 | 📋 |

---

## Prioridades
- 🔴 Crítica — bloquea otras tareas
- 🟡 Alta — importante pero no bloquea
- 🟢 Media — mejora sin urgencia

## Estados
- ✅ Completado
- 🔄 En progreso
- 📋 Pendiente
- ❌ Descartado
