# Guía maestra de despliegue: SERED + Vercel + GitHub

Proceso replicable para publicar una web Next.js con dominio y correo en SERED,
hosting y DNS en Vercel, y despliegue continuo desde GitHub. Pensada para reutilizarse
en cualquier proyecto (ComplexIA, La Impecable, Visita Sanlúcar, etc.).

> **La regla de oro de esta arquitectura:** si los nameservers del dominio apuntan a
> Vercel, **el DNS autoritativo es Vercel**. TODO registro DNS (verificaciones, SPF,
> DKIM, DMARC, MX si aplica) se añade en Vercel. **El panel DNS de SERED se ignora** —
> está muerto. Saltarse esto es la causa de casi todos los líos (Search Console, correo
> en spam, etc.).

---

## Reparto de responsabilidades

| Pieza | Dónde vive | Para qué |
|---|---|---|
| Dominio (registro) | SERED | Propiedad del nombre `.es` |
| Hosting de la web | **Vercel** | Sirve el Next.js, SSL, CDN |
| DNS (autoritativo) | **Vercel** | Todos los registros (A/CNAME/TXT…) |
| Correo corporativo | SERED (cPanel) | Buzón `contacto@dominio` + forwarder |
| Código | GitHub | Repo; Vercel despliega desde `main` |

---

## 1. Preparar el dominio en SERED

1. El dominio está registrado en SERED y asociado a tu cuenta de cPanel
   (ver `guia-correo-sered-vercel.md`, paso 1, si no aparece en cPanel).
2. No hace falta tocar el hosting web de SERED: la web la sirve Vercel.

## 2. Apuntar los nameservers a Vercel

1. En el panel de SERED → gestión del dominio → **Nameservers**.
2. Sustituir los de SERED por los de Vercel:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
3. La propagación puede tardar de minutos a 24-48 h. A partir de aquí, **el DNS se
   gestiona solo en Vercel**.

## 3. Crear el proyecto en Vercel y conectar GitHub

1. Subir el repo a GitHub (p. ej. `usuario/proyecto-web`).
2. Vercel → **Add New… → Project** → importar el repo de GitHub.
3. Framework detectado: **Next.js** (build `next build`, sin config extra).
4. A partir de aquí, **cada `push` a `main` despliega a producción** automáticamente;
   las ramas y PRs generan *Preview Deployments*.

## 4. Añadir el dominio en Vercel

1. Vercel → proyecto → **Settings → Domains** → añadir `dominio.es` y `www.dominio.es`.
2. Elegir el **dominio primario**. En ComplexIA el primario es **`www.complexia.es`**:
   `complexia.es` redirige (307) a `www`. Decide la convención y sé coherente con ella
   en el código (ver paso 7).
3. Como los nameservers ya son de Vercel, la verificación es automática y el SSL se
   emite solo.

## 5. DNS en Vercel

Todos los registros se añaden en Vercel → **Settings → Domains → dominio → DNS Records**:

- **Web:** los registros A/CNAME los gestiona Vercel automáticamente al añadir el dominio.
- **Correo (SPF + DKIM + DMARC):** ver `guia-correo-sered-vercel.md`, paso 5. **Recordatorio:**
  cPanel los genera en su zona muerta; hay que copiarlos a mano a Vercel.
- **Verificaciones** (Search Console, etc.): siempre como TXT en Vercel.

## 6. Variables de entorno

Vercel → **Settings → Environment Variables** (marcar Production + Preview + Development):

| Variable | Valor | Para qué |
|---|---|---|
| `SMTP_PASS` | contraseña del buzón `contacto@` | Envío del formulario (ver guía del formulario) |
| *(otras según proyecto)* | … | Analytics, APIs, etc. |

> Nunca commitear secretos. En local van en `.env.local` (ignorado por git).

## 7. Coherencia de URLs en el código (SEO)

Que el dominio canónico del código **coincida con el que sirve Vercel** (con o sin `www`):

- `app/layout.jsx` → `metadataBase` y `openGraph.url`.
- `app/sitemap.js` y `app/robots.js` → `BASE_URL`.
- Canonical self-referential por página vía `alternates.canonical` (relativo; se resuelve
  contra `metadataBase`).

En ComplexIA todo apunta a `https://www.complexia.es`.

## 8. Correo corporativo

Buzón + forwarder a Gmail + envío desde el formulario: ver **`guia-correo-sered-vercel.md`**.

## 9. Formulario de contacto

Patrón cliente → API → Nodemailer → SMTP: ver **`guia-formulario-contacto.md`**.

## 10. SEO / alta en buscadores

1. **Google Search Console:** propiedad de tipo **Dominio** (cubre www y no-www),
   verificada con TXT en Vercel.
2. Enviar el sitemap: `https://dominio.es/sitemap.xml`.
3. `robots.txt` y `sitemap.xml` los genera Next desde `app/robots.js` y `app/sitemap.js`.

---

## Checklist rápido para un proyecto nuevo

- [ ] Dominio en SERED, asociado a cPanel
- [ ] Nameservers del dominio → `ns1/ns2.vercel-dns.com`
- [ ] Repo en GitHub
- [ ] Proyecto en Vercel importado desde GitHub (deploy automático en `main`)
- [ ] Dominio `+ www` añadidos en Vercel; primario definido
- [ ] Buzón `contacto@` + forwarder a Gmail (guía de correo)
- [ ] SPF + DKIM + DMARC en **Vercel** (guía de correo)
- [ ] `SMTP_PASS` y demás env vars en Vercel
- [ ] Formulario conectado (guía de formulario) y probado con `curl`
- [ ] URLs del código alineadas al dominio canónico
- [ ] Search Console (propiedad Dominio) + sitemap enviado

---

## Documentos relacionados

- `guia-correo-sered-vercel.md` — buzón, forwarder, SPF/DKIM/DMARC, Gmail.
- `guia-formulario-contacto.md` — formulario replicable Next.js + Nodemailer.
