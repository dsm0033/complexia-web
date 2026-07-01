import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { fullAddress } from '@/lib/business-contact'

const COLOR_DARK   = rgb(0.1,  0.1,  0.1)
const COLOR_GRAY   = rgb(0.45, 0.45, 0.45)
const COLOR_LIGHT  = rgb(0.95, 0.95, 0.95)
const COLOR_ACCENT = rgb(0.07, 0.07, 0.07)

const PAYMENT_METHOD_LABELS = {
  efectivo:       'Efectivo',
  transferencia:  'Transferencia bancaria',
  bizum:          'Bizum',
  stripe:         'Pago online (Stripe)',
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export async function generateInvoicePDF({ invoice, paymentMethod, business }) {
  const doc  = await PDFDocument.create()
  const page = doc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const fontBold    = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  let y = height - 50

  // ── CABECERA ──────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 50, width, height: 50, color: COLOR_ACCENT })
  page.drawText(business.name ?? '', {
    x: 40, y: height - 24, size: 18, font: fontBold, color: rgb(1, 1, 1),
  })
  if (business.tagline) {
    page.drawText(business.tagline, {
      x: 40, y: height - 40, size: 8, font: fontRegular, color: rgb(0.75, 0.75, 0.75),
    })
  }
  page.drawText('FACTURA', {
    x: width - 105, y: height - 31, size: 15, font: fontBold, color: rgb(1, 1, 1),
  })

  y = height - 90

  // ── DATOS FACTURA + CLIENTE ───────────────────────────────
  page.drawText('Nº Factura:', { x: 40, y, size: 9, font: fontBold, color: COLOR_GRAY })
  page.drawText(invoice.invoice_number, { x: 40, y: y - 14, size: 13, font: fontBold, color: COLOR_DARK })
  page.drawText('Fecha:', { x: 40, y: y - 36, size: 9, font: fontBold, color: COLOR_GRAY })
  page.drawText(formatDate(invoice.invoice_date), { x: 40, y: y - 50, size: 11, font: fontRegular, color: COLOR_DARK })

  const cx = 320
  page.drawText('Cliente:', { x: cx, y, size: 9, font: fontBold, color: COLOR_GRAY })
  page.drawText(invoice.customer_name || 'Cliente', { x: cx, y: y - 14, size: 11, font: fontBold, color: COLOR_DARK })
  if (invoice.customer_email) {
    page.drawText(invoice.customer_email, { x: cx, y: y - 28, size: 9, font: fontRegular, color: COLOR_GRAY })
  }

  y -= 80

  // ── LÍNEA SEPARADORA ─────────────────────────────────────
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
  y -= 20

  // ── TABLA DE SERVICIOS ────────────────────────────────────
  page.drawRectangle({ x: 40, y: y - 20, width: width - 80, height: 22, color: COLOR_LIGHT })
  page.drawText('DESCRIPCIÓN', { x: 50, y: y - 14, size: 8, font: fontBold, color: COLOR_GRAY })
  page.drawText('IMPORTE',     { x: width - 110, y: y - 14, size: 8, font: fontBold, color: COLOR_GRAY })
  y -= 38

  page.drawText(invoice.service_name, { x: 50, y, size: 10, font: fontRegular, color: COLOR_DARK })
  page.drawText(`${Number(invoice.total_amount).toFixed(2)} €`, {
    x: width - 110, y, size: 10, font: fontRegular, color: COLOR_DARK,
  })

  y -= 40

  // ── LÍNEA SEPARADORA ─────────────────────────────────────
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
  y -= 20

  // ── TOTALES ───────────────────────────────────────────────
  const tx   = width - 220
  const numX = width - 60

  const drawTotal = (label, value, bold = false) => {
    const font  = bold ? fontBold : fontRegular
    const color = bold ? COLOR_DARK : COLOR_GRAY
    page.drawText(label, { x: tx, y, size: bold ? 11 : 9, font, color })
    page.drawText(value, { x: numX - fontRegular.widthOfTextAtSize(value, bold ? 11 : 9), y, size: bold ? 11 : 9, font, color })
    y -= bold ? 20 : 16
  }

  drawTotal('Base imponible:', `${Number(invoice.base_amount).toFixed(2)} €`)
  drawTotal('IVA (21%):', `${Number(invoice.iva_amount).toFixed(2)} €`)

  if (paymentMethod) {
    y -= 6
    drawTotal('Forma de pago:', PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod)
  }

  y -= 14
  page.drawRectangle({ x: tx - 10, y: y - 8, width: numX - tx + 20, height: 28, color: COLOR_ACCENT })
  page.drawText('TOTAL:', { x: tx, y: y + 4, size: 12, font: fontBold, color: rgb(1, 1, 1) })
  const totalStr = `${Number(invoice.total_amount).toFixed(2)} €`
  page.drawText(totalStr, {
    x: numX - fontBold.widthOfTextAtSize(totalStr, 12), y: y + 4, size: 12, font: fontBold, color: rgb(1, 1, 1),
  })

  // ── PIE ───────────────────────────────────────────────────
  page.drawLine({ start: { x: 40, y: 60 }, end: { x: width - 40, y: 60 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) })
  const pieParts = [business.name, business.nif ? `NIF: ${business.nif}` : null].filter(Boolean)
  page.drawText(pieParts.join(' · '), { x: 40, y: 44, size: 8, font: fontRegular, color: COLOR_GRAY })
  const pieParts2 = [fullAddress(business), business.email].filter(Boolean)
  if (pieParts2.length) {
    page.drawText(pieParts2.join(' · '), { x: 40, y: 30, size: 8, font: fontRegular, color: COLOR_GRAY })
  }

  return doc.save()
}
