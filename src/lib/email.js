/**
 * enviarEmailVacacion — notifica al empleado cuando el admin aprueba o rechaza sus vacaciones.
 * Se puede llamar desde cualquier action sin duplicar lógica.
 */
import { resend, emailFrom } from '@/lib/resend'

/**
 * escapeHtml — neutraliza caracteres HTML en texto controlado por el usuario
 * (nombre de cliente, matrícula…) antes de interpolarlo en el HTML del email.
 * Evita inyección de marcado en los correos (hallazgo B2 de la auditoría).
 * Úsalo en `intro`/`outro` al construir el email; los valores de `rows` ya se
 * escapan automáticamente dentro de buildEmail.
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/**
 * formatearFecha — convierte una fecha ISO ('2026-06-17') a texto legible
 * en español ('17 de junio de 2026'). Parsea los componentes a mano para no
 * depender de la zona horaria (new Date('2026-06-17') podría restar un día
 * según el TZ). Si la entrada no es una fecha ISO válida, la devuelve tal cual.
 */
export function formatearFecha(iso) {
  const [y, m, d] = String(iso ?? '').split('-').map(Number)
  if (!y || !m || !d || m < 1 || m > 12) return String(iso ?? '')
  return `${d} de ${MESES[m - 1]} de ${y}`
}

export async function enviarEmailVacacion({ supabase, businessId, requestId, status, adminNotes }) {
  if (!resend) return

  const [{ data: req }, { data: business }] = await Promise.all([
    supabase
      .from('vacation_requests')
      .select('start_date, end_date, working_days, employees(full_name, email)')
      .eq('id', requestId)
      .single(),
    supabase
      .from('businesses')
      .select('name, address, phone, email')
      .eq('id', businessId)
      .single(),
  ])

  if (!req?.employees?.email) return

  const aprobada = status === 'aprobada'
  const from = emailFrom(business)

  await resend.emails.send({
    from,
    to: req.employees.email,
    subject: aprobada
      ? `Vacaciones aprobadas — ${req.start_date} al ${req.end_date}`
      : `Solicitud de vacaciones no aprobada — ${req.start_date} al ${req.end_date}`,
    html: buildEmail({
      title: aprobada ? '¡Tus vacaciones han sido aprobadas!' : 'Solicitud de vacaciones no aprobada',
      intro: aprobada
        ? `Hola <strong>${req.employees.full_name}</strong>, tu solicitud de vacaciones ha sido aprobada.`
        : `Hola <strong>${req.employees.full_name}</strong>, tu solicitud de vacaciones no ha podido ser aprobada en esta ocasión.`,
      rows: [
        ['Período',          `${req.start_date} al ${req.end_date}`],
        ['Días laborables',  String(req.working_days ?? '—')],
        ...(adminNotes ? [['Nota', adminNotes]] : []),
      ],
      business,
    }),
  })
}

/**
 * buildEmail — template HTML reutilizable para todos los emails de la app.
 *
 * @param {object} opts
 * @param {string} opts.title       - Título principal del email
 * @param {string} [opts.intro]     - Párrafo introductorio (opcional)
 * @param {Array}  [opts.rows]      - Filas de datos: [['Label', 'Valor'], ...]
 * @param {string} [opts.outro]     - Párrafo de cierre (opcional)
 * @param {object} [opts.business]  - Datos del negocio para el pie
 */
export function buildEmail({ title, intro, rows = [], outro, business = {} }) {
  const { name = 'Impecable', address = '', phone = '', email = '' } = business

  // Las celdas de rows son datos (nunca markup): se escapan siempre.
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 20px 10px 0;color:#6b7280;font-size:14px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #f3f4f6;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #f3f4f6;">${escapeHtml(value)}</td>
    </tr>`).join('')

  const contactLine = [
    phone ? `<a href="tel:${phone.replace(/\s/g, '')}" style="color:#9ca3af;text-decoration:none;">${phone}</a>` : '',
    email ? `<a href="mailto:${email}" style="color:#C9A84C;text-decoration:none;">${email}</a>` : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Cabecera -->
        <tr>
          <td style="background:#0A0E14;padding:28px 32px;text-align:center;border-radius:12px 12px 0 0;">
            <p style="margin:0;font-size:20px;font-weight:900;letter-spacing:5px;color:#C9A84C;text-transform:uppercase;">${name.toUpperCase()}</p>
            <div style="width:36px;height:2px;background:#C9A84C;margin:10px auto 0;"></div>
          </td>
        </tr>

        <!-- Cuerpo -->
        <tr>
          <td style="background:#ffffff;padding:32px;">
            <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">${title}</h2>
            ${intro ? `<p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">${intro}</p>` : ''}
            ${rows.length ? `
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:${outro ? '24px' : '0'};">
              ${rowsHtml}
            </table>` : ''}
            ${outro ? `<p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">${outro}</p>` : ''}
          </td>
        </tr>

        <!-- Pie -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 32px;text-align:center;border-radius:0 0 12px 12px;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;">${name}</p>
            ${address ? `<p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">${address}</p>` : ''}
            ${contactLine ? `<p style="margin:0;font-size:12px;">${contactLine}</p>` : ''}
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
