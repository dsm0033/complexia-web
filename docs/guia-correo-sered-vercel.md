# Guía: correo corporativo con SERED + Vercel + Gmail

Proceso completo para tener un buzón `contacto@tudominio.es` alojado en SERED,
integrado con Gmail y con el formulario web enviando desde Vercel.

---

## Requisitos previos

- Dominio con nameservers apuntando a Vercel (gestión DNS en Vercel)
- Hosting activo en SERED
- Cuenta de Gmail donde quieres recibir y responder los emails

---

## 1. Asociar el dominio a tu cuenta de cPanel en SERED

Si el dominio ya existe en el cluster de SERED pero no aparece en tu cPanel:

1. cPanel → **Domains** → **Create a New Domain**
2. Escribe el dominio (ej. `complexia.es`)
3. **Desmarca** "Share document root" — el dominio no comparte carpeta con otros sitios
4. Pulsa **Submit**

> Si aparece el error *"Dominio ya existente en el cluster"*, contacta con soporte de SERED
> indicando: *"Necesito que asociéis el dominio X a mi cuenta de cPanel para gestionar el correo."*

---

## 2. Crear el buzón de correo

1. cPanel → **Email Accounts** → **Create**
2. Usuario: `contacto`, dominio: `tudominio.es`
3. Establece una contraseña segura
4. Pulsa **Create**

---

## 3. Configurar el Forwarder (SERED → Gmail)

Para que los emails que lleguen al buzón aparezcan en tu Gmail:

1. cPanel → **Forwarders** → **Add Forwarder**
2. Address to forward: `contacto` (dominio: `tudominio.es`)
3. Forward to email address: `tu@gmail.com`
4. Pulsa **Add Forwarder**

---

## 4. Configurar Gmail para enviar como `contacto@tudominio.es`

1. Gmail → **Configuración** → **Ver todos los ajustes** → pestaña **Cuentas e importación**
2. Sección **"Enviar correo como"** → **Añadir otra dirección de correo**
3. Nombre: el que quieras mostrar · Email: `contacto@tudominio.es`
4. Configura el SMTP de SERED:
   - Servidor SMTP: `mail.tudominio.es`
   - Puerto: `465`
   - Conexión segura: **SSL**
   - Usuario: `contacto@tudominio.es`
   - Contraseña: la del buzón
5. Google enviará un código de verificación al buzón — léelo en el webmail de cPanel
   (`mail.tudominio.es/webmail`) y pégalo en Gmail

---

## 5. Añadir el registro SPF en Vercel DNS

SERED usa **MailChannels** como relay de salida. Sin este registro, Gmail rechaza los emails.

1. Vercel → **Dashboard** → **Domains** → `tudominio.es` → pestaña **DNS Records**
2. Añade este registro:

   | Name | Type | Value |
   |------|------|-------|
   | `@` | `TXT` | `v=spf1 ip4:162.19.86.115 include:relay.mailchannels.net ~all` |

3. Espera 15-20 minutos a que propague y prueba enviando un email desde Gmail

> **Importante:** no puede haber dos registros TXT con `v=spf1` en el mismo dominio.
> Si ya existe uno, edítalo en lugar de crear otro.

---

## 6. Configurar el formulario web (Next.js + Nodemailer)

Para que el formulario de contacto de la web envíe emails desde Vercel:

### Instalar Nodemailer

```bash
npm install nodemailer
```

### `lib/mail.js`

```js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'mail.tudominio.es',
  port: 465,
  secure: true,
  auth: {
    user: 'contacto@tudominio.es',
    pass: process.env.SMTP_PASS,
  },
});

export async function sendContactEmail({ nombre, email, empresa, mensaje }) {
  return transporter.sendMail({
    from: '"NombreEmpresa" <contacto@tudominio.es>',
    to: 'contacto@tudominio.es',
    replyTo: email,
    subject: `Nuevo contacto de ${nombre}`,
    text: `Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`,
  });
}
```

### Variables de entorno

En `.env.local`:
```
SMTP_PASS=contraseña_del_buzón
```

En **Vercel → Settings → Environment Variables**:
- Name: `SMTP_PASS`
- Value: contraseña del buzón
- Entornos: Production, Preview, Development

---

## Resultado final

| Función | Cómo funciona |
|---|---|
| Recibir emails del formulario web | Nodemailer → SMTP SERED → buzón → Forwarder → Gmail |
| Recibir emails directos a `contacto@` | SERED → Forwarder → Gmail |
| Responder como `contacto@` desde Gmail | Gmail SMTP → SERED (autorizado por SPF con MailChannels) |
