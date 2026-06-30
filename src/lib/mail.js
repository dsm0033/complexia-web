import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'mail.complexia.es',
  port: 465,
  secure: true,
  auth: {
    user: 'contacto@complexia.es',
    pass: process.env.SMTP_PASS,
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
  // El cuerpo de texto va en plano (no se interpreta como HTML).
  // El cuerpo HTML usa las versiones escapadas para no ejecutar marcado del visitante.
  const safe = {
    nombre: escapeHtml(nombre),
    email: escapeHtml(email),
    empresa: escapeHtml(empresa),
    mensaje: escapeHtml(mensaje),
  };

  return transporter.sendMail({
    from: '"ComplexIA" <contacto@complexia.es>',
    to: 'contacto@complexia.es',
    replyTo: email,
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
