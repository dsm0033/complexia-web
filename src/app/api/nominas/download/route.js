import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { calcularNomina } from '@/lib/payroll'
import { fullAddress } from '@/lib/business-contact'

const C_DARK   = rgb(0.08, 0.08, 0.08)
const C_GRAY   = rgb(0.45, 0.45, 0.45)
const C_LGRAY  = rgb(0.93, 0.93, 0.93)
const C_LINE   = rgb(0.80, 0.80, 0.80)
const C_WHITE  = rgb(1, 1, 1)
const C_HEADER = rgb(0.07, 0.07, 0.07)

// pdf-lib (Helvetica) no soporta tildes ni ñ — sanitizamos
function s(str) {
  return (str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ñÑ]/g, (c) => (c === 'ñ' ? 'n' : 'N'))
}

function fmt(n) {
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR'
}

function fmtPct(ratio) {
  return (Number(ratio) * 100).toFixed(2) + ' %'
}

// Muestra solo los 4 primeros y 4 últimos caracteres del IBAN
function ocultarIban(iban) {
  if (!iban) return null
  const limpio = iban.replace(/\s/g, '').toUpperCase()
  if (limpio.length < 8) return iban
  const visible = limpio.slice(0, 4)
  const oculto  = '*'.repeat(limpio.length - 8)
  const final   = limpio.slice(-4)
  return `${visible} ${oculto} ${final}`
}

function nombreMes(mes) {
  const [y, m] = mes.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    .toUpperCase()
}

async function generarPDF({ empleado, contrato, calculo, ssRates, grupoDesc, mes, acumulados, business }) {
  const doc  = await PDFDocument.create()
  const page = doc.addPage([595, 842])
  const { width, height } = page.getSize()

  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const reg  = await doc.embedFont(StandardFonts.Helvetica)

  // Helpers de dibujo
  const txt = (text, x, yy, { size = 9, font = reg, color = C_DARK } = {}) =>
    page.drawText(s(text), { x, y: yy, size, font, color })

  const line = (x1, yy1, x2, yy2, thickness = 0.5, color = C_LINE) =>
    page.drawLine({ start: { x: x1, y: yy1 }, end: { x: x2, y: yy2 }, thickness, color })

  const rect = (x, yy, w, h, color) =>
    page.drawRectangle({ x, y: yy, width: w, height: h, color })

  const M = 40            // margen horizontal
  const W = width - M * 2 // ancho útil

  let y = height

  // ── CABECERA ──────────────────────────────────────────────────────────────
  rect(0, height - 52, width, 52, C_HEADER)
  txt(business.name ?? '',  M, height - 20, { size: 16, font: bold, color: C_WHITE })
  if (business.tagline)
    txt(business.tagline,   M, height - 36, { size:  8, color: rgb(0.72, 0.72, 0.72) })
  txt('RECIBO DE SALARIOS', width - 170, height - 24, { size: 11, font: bold, color: C_WHITE })
  txt(nombreMes(mes),       width - 170, height - 40, { size:  8, color: rgb(0.72, 0.72, 0.72) })

  y = height - 66

  // ── BLOQUE EMPRESA / EMPLEADO ─────────────────────────────────────────────
  const c2 = M + W / 2 + 10

  txt('EMPRESA',    M,  y, { size: 7, font: bold, color: C_GRAY })
  txt('EMPLEADO/A', c2, y, { size: 7, font: bold, color: C_GRAY })
  y -= 13

  txt(business.name ?? '',              M,  y, { size: 10, font: bold })
  txt(empleado.full_name.toUpperCase(), c2, y, { size: 10, font: bold })
  y -= 12

  if (business.nif) txt(`NIF: ${business.nif}`, M, y, { size: 8, color: C_GRAY })
  if (contrato.dni) txt(`NIF: ${contrato.dni}`,  c2, y, { size: 8, color: C_GRAY })
  y -= 11

  if (business.ccc) txt(`CCC: ${business.ccc}`, M, y, { size: 8, color: C_GRAY })
  if (contrato.ss_affiliation)
    txt(`N.Afil.SS: ${contrato.ss_affiliation}`, c2, y, { size: 8, color: C_GRAY })
  y -= 11

  const contactoEmpresa = [fullAddress(business), business.email].filter(Boolean).join('  ·  ')
  if (contactoEmpresa) txt(contactoEmpresa, M, y, { size: 7, color: C_GRAY })
  const catLabel = s(contrato.category || empleado.position || '')
  if (catLabel) txt(`Categoria: ${catLabel}`, c2, y, { size: 8, color: C_GRAY })
  y -= 11

  txt(s(`Grupo cotiz.: ${grupoDesc}`), c2, y, { size: 8, color: C_GRAY })
  y -= 11

  const tipoContrato = contrato.contract_type === 'indefinido' ? 'Indefinido' : 'Temporal'
  txt(`Contrato: ${tipoContrato}  ·  Jornada: ${contrato.weekly_hours ?? 37.5}h/sem`, c2, y, { size: 8, color: C_GRAY })

  y -= 16
  line(M, y, width - M, y)
  y -= 16

  // ── DEVENGOS ──────────────────────────────────────────────────────────────
  rect(M, y - 18, W, 20, C_LGRAY)
  txt('DEVENGOS', M + 10, y - 12, { size: 8, font: bold, color: C_GRAY })
  txt('IMPORTE',  width - M - 52, y - 12, { size: 8, font: bold, color: C_GRAY })
  y -= 30

  const numX = width - M  // alineación derecha importes

  const fila = (label, valor, negrita = false) => {
    const f = negrita ? bold : reg
    const c = negrita ? C_DARK : C_GRAY
    txt(label, M + 10, y, { size: 9, font: f, color: c })
    const v = fmt(valor)
    page.drawText(s(v), { x: numX - reg.widthOfTextAtSize(s(v), 9), y, size: 9, font: f, color: c })
    y -= 15
  }

  const salarioMensual = Number(contrato.gross_annual) / Number(contrato.num_payments)
  fila('Salario base', salarioMensual)
  if (calculo.esPagaExtra) fila('Paga extra', salarioMensual)

  y -= 4
  line(M, y, width - M, y, 0.3)
  y -= 13

  txt('TOTAL DEVENGADO (1)', M + 10, y, { font: bold })
  const vDev = fmt(calculo.brutoMensual)
  page.drawText(s(vDev), { x: numX - bold.widthOfTextAtSize(s(vDev), 9), y, size: 9, font: bold, color: C_DARK })
  y -= 22

  // ── DEDUCCIONES ───────────────────────────────────────────────────────────
  rect(M, y - 18, W, 20, C_LGRAY)
  txt('DEDUCCIONES', M + 10, y - 12, { size: 8, font: bold, color: C_GRAY })
  txt('IMPORTE',     width - M - 52, y - 12, { size: 8, font: bold, color: C_GRAY })
  y -= 30

  const getRateW = (concept, fallback) =>
    Number(ssRates.find(r => r.concept === concept)?.worker_rate ?? fallback) / 100

  const conceptoDes = contrato.contract_type === 'indefinido' ? 'desempleo_indefinido' : 'desempleo_temporal'
  const factor = calculo.esPagaExtra ? 2 : 1
  const base1  = salarioMensual  // base de un mes (para aplicar tipos)

  fila(`Contingencias comunes   (${fmtPct(getRateW('contingencias_comunes', 4.70))})`,  base1 * getRateW('contingencias_comunes', 4.70)  * factor)
  fila(`Desempleo               (${fmtPct(getRateW(conceptoDes, 1.55))})`,               base1 * getRateW(conceptoDes, 1.55)              * factor)
  fila(`Formacion Profesional   (${fmtPct(getRateW('formacion_profesional', 0.10))})`,   base1 * getRateW('formacion_profesional', 0.10)  * factor)
  fila(`MEI                     (${fmtPct(getRateW('mei', 0.15))})`,                      base1 * getRateW('mei', 0.15)                   * factor)
  fila(`Retencion IRPF          (${fmtPct(calculo.irpfRate)})`,                           calculo.deduccionIRPF)

  y -= 4
  line(M, y, width - M, y, 0.3)
  y -= 13

  txt('TOTAL DEDUCCIONES (2)', M + 10, y, { font: bold })
  const vDed = fmt(calculo.deduccionSS + calculo.deduccionIRPF)
  page.drawText(s(vDed), { x: numX - bold.widthOfTextAtSize(s(vDed), 9), y, size: 9, font: bold, color: C_DARK })
  y -= 24

  // ── LÍQUIDO A PERCIBIR ────────────────────────────────────────────────────
  line(M, y, width - M, y)
  y -= 4
  rect(M, y - 28, W, 30, C_HEADER)
  txt('LIQUIDO A PERCIBIR  (1) - (2)', M + 12, y - 14, { size: 10, font: bold, color: C_WHITE })
  const vNeto = fmt(calculo.neto)
  page.drawText(s(vNeto), {
    x: numX - bold.widthOfTextAtSize(s(vNeto), 12),
    y: y - 15, size: 12, font: bold, color: C_WHITE,
  })
  y -= 48

  // ── BASES DE COTIZACIÓN ───────────────────────────────────────────────────
  line(M, y, width - M, y)
  y -= 14

  txt('BASES DE COTIZACION', M, y, { size: 8, font: bold, color: C_GRAY })
  y -= 13

  // Tabla bases
  const bCol = [M, M + 180, M + 310, M + 420]
  const bHead = ['Concepto', 'Base', 'Tipo trab.', 'Cuota trab.']
  bHead.forEach((h, i) => txt(h, bCol[i], y, { size: 7, font: bold, color: C_GRAY }))
  y -= 12

  const basesRows = [
    {
      label: 'Contingencias comunes',
      base: calculo.brutoMensual,
      tipo: getRateW('contingencias_comunes', 4.70),
      cuota: calculo.deduccionSS - (
        calculo.brutoMensual * getRateW(conceptoDes, 1.55) +
        calculo.brutoMensual * getRateW('formacion_profesional', 0.10) +
        calculo.brutoMensual * getRateW('mei', 0.15)
      ),
    },
    {
      label: 'IRPF',
      base: calculo.brutoMensual,
      tipo: calculo.irpfRate,
      cuota: calculo.deduccionIRPF,
    },
  ]

  for (const row of basesRows) {
    txt(row.label,         bCol[0], y, { size: 7, color: C_GRAY })
    txt(fmt(row.base),     bCol[1], y, { size: 7, color: C_GRAY })
    txt(fmtPct(row.tipo),  bCol[2], y, { size: 7, color: C_GRAY })
    txt(fmt(row.cuota),    bCol[3], y, { size: 7, color: C_GRAY })
    y -= 11
  }

  // ── ACUMULADOS IRPF ───────────────────────────────────────────────────────
  y -= 14
  txt('ACUMULADOS IRPF (ejercicio actual)', M, y, { size: 7, font: bold, color: C_GRAY })
  y -= 12

  const aC = [M, M + 165, M + 330]
  ;['Integro bruto', 'Total retenido', 'Gastos deducibles (SS)'].forEach((h, i) =>
    txt(h, aC[i], y, { size: 7, font: bold, color: C_GRAY })
  )
  y -= 11

  txt(fmt(acumulados.integro),  aC[0], y, { size: 7, color: C_GRAY })
  txt(fmt(acumulados.retenido), aC[1], y, { size: 7, color: C_GRAY })
  txt(fmt(acumulados.gastos),   aC[2], y, { size: 7, color: C_GRAY })

  y -= 20

  // ── DATOS BANCARIOS ───────────────────────────────────────────────────────
  const ibanOculto = ocultarIban(empleado.iban)
  if (ibanOculto) {
    line(M, y, width - M, y, 0.3)
    y -= 12
    txt('DATOS BANCARIOS', M, y, { size: 7, font: bold, color: C_GRAY })
    y -= 11
    txt(`IBAN: ${ibanOculto}`, M, y, { size: 8, color: C_DARK })
    y -= 14
  }

  // ── PIE ───────────────────────────────────────────────────────────────────
  line(M, 55, width - M, 55)
  const piePartes = [business.name, business.nif ? `NIF: ${business.nif}` : null, fullAddress(business), business.email].filter(Boolean)
  txt(piePartes.join('  ·  '), M, 40, { size: 7, color: C_GRAY })

  return doc.save()
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get('employee_id')
  const mes        = searchParams.get('mes')

  if (!employeeId || !mes)
    return NextResponse.json({ error: 'Parametros incorrectos.' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    // El empleado solo puede descargar su propia nómina
    const { data: self } = await supabase
      .from('employees')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!self || self.id !== employeeId)
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  const year = parseInt(mes.split('-')[0])

  const [
    { data: empleado },
    { data: contrato },
    { data: ssRates },
    { data: irpfBrackets },
    { data: settingsRows },
    { data: business },
  ] = await Promise.all([
    supabase.from('employees').select('id, full_name, position, iban').eq('id', employeeId).single(),
    supabase.from('employee_contracts').select('*').eq('employee_id', employeeId).eq('active', true).maybeSingle(),
    supabase.from('ss_rates').select('concept, worker_rate, company_rate').eq('year', year),
    supabase.from('irpf_brackets').select('min_income, max_income, rate').eq('year', year),
    supabase.from('payroll_settings').select('key, value').eq('year', year),
    supabase.from('businesses').select('name, nif, ccc, tagline, address, postal_code, city, province, email').eq('id', profile.business_id).single(),
  ])

  if (!empleado || !contrato)
    return NextResponse.json({ error: 'Empleado o contrato no encontrado.' }, { status: 404 })

  const settings = Object.fromEntries((settingsRows ?? []).map(r => [r.key, r.value]))
  const calculo  = calcularNomina({
    contract: contrato, ssRates: ssRates ?? [],
    irpfBrackets: irpfBrackets ?? [], settings, mes,
  })

  // Descripción del grupo de cotización
  let grupoDesc = `${contrato.contribution_group}`
  const { data: grupo } = await supabase
    .from('contribution_groups')
    .select('description')
    .eq('group_number', contrato.contribution_group)
    .eq('year', year)
    .maybeSingle()
  if (grupo?.description) grupoDesc = `${contrato.contribution_group} - ${grupo.description}`

  // Acumulados IRPF del ejercicio (enero → mes actual)
  const monthNum = parseInt(mes.split('-')[1])
  const brutoNormal = Number(contrato.gross_annual) / Number(contrato.num_payments)
  let pagasExtraHasta = 0
  if (Number(contrato.num_payments) === 14) {
    if (monthNum >= 6)  pagasExtraHasta++
    if (monthNum >= 12) pagasExtraHasta++
  }
  const mesesTotal = monthNum + pagasExtraHasta
  const acumulados = {
    integro:  brutoNormal * mesesTotal,
    retenido: brutoNormal * calculo.irpfRate * mesesTotal,
    gastos:   brutoNormal * calculo.ssTotalWorker * mesesTotal,
  }

  const pdfBytes = await generarPDF({
    empleado, contrato, calculo,
    ssRates: ssRates ?? [], grupoDesc, mes, acumulados,
    business: business ?? {},
  })

  const [y, m] = mes.split('-')
  const nombre = empleado.full_name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')
  const filename = `nomina-${nombre}-${y}-${m}.pdf`

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
