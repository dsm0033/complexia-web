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

## 5. Autenticación de correo en Vercel DNS: SPF + DKIM + DMARC

> ⚠️ **La lección más importante de esta guía.** cPanel de SERED autogenera los tres
> registros de autenticación (SPF, DKIM, DMARC), pero los crea en **su propia zona DNS**.
> Si el dominio usa los nameservers de Vercel, **esa zona de SERED está MUERTA**: el DNS
> autoritativo es Vercel. Por tanto los tres registros hay que copiarlos **A MANO a Vercel**.
> Si no, el correo sale sin autenticar y Gmail/Outlook lo penalizan o lo mandan a spam
> (desde 2024 es prácticamente obligatorio para dominios que envían correo).
>
> Es el mismo fenómeno que afecta a la verificación de dominios (Search Console, etc.):
> **cualquier registro DNS va SIEMPRE en Vercel, nunca en el panel de SERED.**

Todos los registros se añaden en: Vercel → **Dashboard** → **Domains** → `tudominio.es` → pestaña **DNS Records**.

### 5.1 SPF

SERED usa **MailChannels** como relay de salida. Sin este registro, Gmail rechaza los emails.

| Name | Type | Value |
|------|------|-------|
| `@` | `TXT` | `v=spf1 ip4:162.19.86.115 include:relay.mailchannels.net ~all` |

> La IP es la del servidor real de tu cuenta — verifícala con `nslookup -type=a mail.tudominio.es`.
> **Importante:** no puede haber dos registros TXT con `v=spf1` en el mismo dominio.
> Si ya existe uno, edítalo en lugar de crear otro.

### 5.2 DKIM

1. cPanel → **Email Deliverability / Capacidad de entrega** → fila del dominio → **Manage / Administrar**
2. Copia el registro DKIM (selector `default`): el Name será `default._domainkey` y el
   Value `v=DKIM1; k=rsa; p=...` (clave pública RSA, muy larga).
3. Añádelo en Vercel:

| Name | Type | Value |
|------|------|-------|
| `default._domainkey` | `TXT` | `v=DKIM1; k=rsa; p=MIIBIjANBgkq...IDAQAB;` |

> Pégalo en **una sola línea**: Vercel parte los TXT largos en trozos de 255 caracteres
> automáticamente; no tienes que hacer nada.

### 5.3 DMARC

Arranca en **modo monitor** (`p=none`): no bloquea nada, solo recopila informes.

| Name | Type | Value |
|------|------|-------|
| `_dmarc` | `TXT` | `v=DMARC1; p=none; rua=mailto:tu@gmail.com` |

> Con el tiempo, cuando confirmes por los informes que el correo legítimo pasa,
> endurece a `p=quarantine` y finalmente `p=reject`.

### 5.4 Verificar

```bash
nslookup -type=TXT tudominio.es                        # SPF
nslookup -type=TXT default._domainkey.tudominio.es     # DKIM
nslookup -type=TXT _dmarc.tudominio.es                 # DMARC
```

Prueba de extremo a extremo: envíate un correo a la dirección que da
[mail-tester.com](https://www.mail-tester.com) y comprueba que SPF, DKIM y DMARC
salen en verde (objetivo 10/10).

> El panel "Email Deliverability" de cPanel mostrará estos dominios en **ROJO**
> (*"DNS Errors Occurred"*) porque valida contra su propia zona DNS muerta. Es un
> **falso negativo**: la fuente de verdad es la resolución DNS pública (`nslookup` /
> mail-tester), no cPanel.

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
