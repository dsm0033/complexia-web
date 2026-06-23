# Guía: formulario de contacto replicable (Next.js App Router + Nodemailer)

Patrón usado en ComplexIA para un formulario de contacto que envía emails sin
exponer credenciales en el navegador. Replicable en cualquier web Next.js (App Router).

**Stack de referencia:** Next 16 · React 19 · `nodemailer ^8` · despliegue en Vercel.

---

## Arquitectura — el flujo

```
[Formulario cliente]  →  fetch POST  →  [API route servidor]  →  [Nodemailer]  →  SMTP del hosting  →  buzón  →  (forwarder)  →  Gmail
   Contacto.jsx                          api/contacto/route.js     lib/mail.js
```

**Principio clave:** el navegador NUNCA toca el SMTP ni la contraseña. El cliente solo
habla con tu propia API (`/api/contacto`); el envío real ocurre en el servidor, donde
vive la credencial (`SMTP_PASS`). Así la contraseña del buzón no llega nunca al cliente.

---

## Pieza 1 — `lib/mail.js` (envío, servidor)

```js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'mail.TUDOMINIO.es',        // ← SMTP de tu hosting
  port: 465,
  secure: true,                      // SSL
  auth: {
    user: 'contacto@TUDOMINIO.es',  // ← buzón emisor
    pass: process.env.SMTP_PASS,     // ← NUNCA hardcodear
  },
});

// Escapa caracteres especiales para evitar inyección de HTML en el email recibido.
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContactEmail({ nombre, email, empresa, mensaje }) {
  const safe = {
    nombre: escapeHtml(nombre),
    email: escapeHtml(email),
    empresa: escapeHtml(empresa),
    mensaje: escapeHtml(mensaje),
  };

  return transporter.sendMail({
    from: '"NOMBRE WEB" <contacto@TUDOMINIO.es>',
    to: 'contacto@TUDOMINIO.es',     // ← dónde recibes
    replyTo: email,                  // responder al visitante directo desde Gmail
    subject: `Nuevo contacto de ${nombre}${empresa ? ` — ${empresa}` : ''}`,
    text: `Nombre: ${nombre}\nEmail: ${email}\nEmpresa: ${empresa || '—'}\n\n${mensaje}`,
    html: `
      <table style="font-family:sans-serif;font-size:15px;color:#1a1a1a;max-width:600px">
        <tr><td style="padding:8px 0"><strong>Nombre:</strong> ${safe.nombre}</td></tr>
        <tr><td style="padding:8px 0"><strong>Email:</strong> ${safe.email}</td></tr>
        <tr><td style="padding:8px 0"><strong>Empresa:</strong> ${safe.empresa || '—'}</td></tr>
        <tr><td style="padding:24px 0 8px"><strong>Mensaje:</strong></td></tr>
        <tr><td style="padding:0 0 8px;white-space:pre-wrap">${safe.mensaje}</td></tr>
      </table>
    `,
  });
}
```

**Cambia por web:** `host`, `user`, `from`, `to`.
**Conserva:** `replyTo: email` (responder al cliente con un clic) y el `escapeHtml`
(el cuerpo HTML interpola datos del visitante: sin escapar, un bot podría inyectar marcado).

---

## Pieza 2 — `app/api/contacto/route.js` (validación + anti-spam, servidor)

```js
import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/mail';

export async function POST(request) {
  const { nombre, email, empresa, mensaje, consentimiento, website } = await request.json();

  // Honeypot: campo trampa invisible. Si viene relleno es un bot;
  // devolvemos OK falso para no revelarle que lo hemos detectado.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!nombre?.trim() || !email?.trim() || !mensaje?.trim())
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });

  if (consentimiento !== true)                     // RGPD: defensa en profundidad
    return NextResponse.json({ error: 'Debes aceptar la política de privacidad.' }, { status: 400 });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });

  try {
    await sendContactEmail({ nombre: nombre.trim(), email: email.trim(), empresa: empresa?.trim(), mensaje: mensaje.trim() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.' }, { status: 500 });
  }
}
```

**Se replica casi idéntico.** Valida SIEMPRE en servidor (nunca te fíes solo del cliente).
El honeypot va lo primero; la validación de `consentimiento` es obligatoria si recoges
datos personales (RGPD).

---

## Pieza 3 — `components/sections/Contacto.jsx` (formulario, cliente)

Lo esencial (la maquetación es libre):

```jsx
'use client';
import { useState } from 'react';

const INITIAL = { nombre: '', email: '', empresa: '', mensaje: '', consentimiento: false, website: '' };

export default function Contacto() {
  const [form, setForm] = useState(INITIAL);
  const [estado, setEstado] = useState('idle'); // idle | loading | ok | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEstado('loading'); setErrorMsg('');
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setEstado('ok'); setForm(INITIAL);
    } catch (err) { setErrorMsg(err.message); setEstado('error'); }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot: invisible para humanos, los bots lo rellenan */}
      <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">No rellenar este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1}
               autoComplete="off" value={form.website} onChange={handleChange} />
      </div>

      {/* ...inputs nombre/email/empresa/mensaje con name/value/onChange... */}
      {/* checkbox de consentimiento RGPD enlazando a /legal/privacidad */}

      <button type="submit" disabled={estado === 'loading' || !form.consentimiento}>
        {estado === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
      {/* mostrar pantalla de éxito cuando estado === 'ok' */}
    </form>
  );
}
```

**Patrones a conservar:**
- Un solo objeto `form` + `handleChange` genérico → escala a N campos sin código nuevo.
- Máquina de 4 estados `idle/loading/ok/error`.
- Botón **deshabilitado hasta marcar el consentimiento** (RGPD).
- **Honeypot** oculto con posición (no `display:none`, que algunos bots ignoran),
  marcado `aria-hidden`, `tabIndex={-1}` y `autoComplete="off"` para no molestar a humanos.
- Reseteo del formulario al enviar con éxito.

---

## Montaje en una web nueva (checklist)

1. **Correo:** crear buzón `contacto@nuevodominio` y, si recibes en Gmail, el *forwarder*
   + SPF/DKIM/DMARC en el DNS (ver `guia-correo-sered-vercel.md`).
2. **Dependencia:** `npm install nodemailer`
3. **Copiar las 3 piezas** y ajustar en `lib/mail.js`: `host`, `user`, `from`, `to`.
4. **Variable de entorno** `SMTP_PASS` (contraseña del buzón) en `.env.local` **y** en
   Vercel → Settings → Environment Variables (Production/Preview/Development). Nunca en el repo.
5. **Enlace** del checkbox a la `/legal/privacidad` de esa web.
6. **Probar** con un POST real:
   ```bash
   curl -X POST https://www.NUEVODOMINIO.es/api/contacto \
     -H 'Content-Type: application/json' \
     -d '{"nombre":"Test","email":"tu@gmail.com","mensaje":"prueba","consentimiento":true}'
   ```
   Esperado: `{"ok":true}` + correo en Gmail. Para verificar el honeypot, repite añadiendo
   `"website":"x"`: debe devolver `{"ok":true}` PERO no llegar ningún correo.

---

## Notas y posibles mejoras futuras

- **Rate limiting:** el honeypot frena bots tontos pero no limita la frecuencia. Para
  tráfico alto, añadir un límite por IP (p. ej. con `@upstash/ratelimit`).
- **Doble opt-in / autorespuesta:** se puede enviar también un email de confirmación al
  visitante reutilizando el mismo `transporter`.
- **`createTransport` a nivel de módulo** es correcto: no abre conexión ni valida la
  contraseña al crearse, así que no rompe el build aunque `SMTP_PASS` falte en build time
  (a diferencia de SDKs como Resend, que sí deben instanciarse dentro de la función).
