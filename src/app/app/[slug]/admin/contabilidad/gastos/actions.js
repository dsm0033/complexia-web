'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { getAdminCtx } from '@/lib/admin-context'
import Anthropic from '@anthropic-ai/sdk'

const OCR_MODEL  = 'claude-haiku-4-5'
const BUCKET     = 'expense-files'
const EXT_BY_MIME = {
  'image/jpeg':      'jpg',
  'image/png':       'png',
  'image/webp':      'webp',
  'image/gif':       'gif',
  'application/pdf': 'pdf',
}

const PROMPT_OCR = `Analiza esta factura de proveedor y extrae los datos. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni bloques de código:
{
  "date": "YYYY-MM-DD",
  "amount": <importe total con IVA, número decimal>,
  "iva_rate": <0, 4, 10 o 21>,
  "description": "<concepto principal del gasto, SIEMPRE en español. Si la factura está en otro idioma, traduce al español>",
  "provider": "<nombre del proveedor o empresa emisora, tal cual aparece>",
  "invoice_number": "<número de factura del proveedor tal cual aparece, si no null>",
  "category": "<suministros|alquiler|nominas|material|publicidad|mantenimiento_web|ia|otros>",
  "notes": "<información adicional relevante distinta del número de factura, si no null>"
}

Pistas para la categoría:
- mantenimiento_web: hosting (Vercel, AWS), bases de datos (Supabase, MongoDB), dominios, CDN, email transaccional (Resend, SendGrid), monitorización (Sentry).
- ia: créditos o suscripciones de Anthropic (Claude), OpenAI (ChatGPT, GPT), Google (Gemini), modelos de imagen, APIs de IA generativa.
- suministros: agua, luz, gas, internet, teléfono fijo, telefonía móvil del negocio.
- material: consumibles físicos del taller (productos de limpieza, herramientas, repuestos).

Si no puedes determinar un campo, usa null.`

function extFor(file) {
  return EXT_BY_MIME[file.type] ?? (file.name?.split('.').pop()?.toLowerCase() || 'bin')
}

// Slug para nombrar archivos. Quita acentos, deja solo letras y números,
// limita a 50 chars para no generar paths absurdamente largos.
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')

function slugify(text) {
  return (text || 'sin-proveedor')
    .toLowerCase()
    .normalize('NFD').replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'sin-proveedor'
}

// Path navegable: businessId / año / proveedor-slug / fecha_importe_idCorto.ext
// La primera carpeta sigue siendo business_id para que la RLS del bucket
// (storage.foldername(name))[1] = business_id) siga funcionando sin tocar.
function buildInvoicePath(businessId, expenseId, fields, file) {
  const year     = (fields.date ?? '').slice(0, 4) || 'sin-fecha'
  const provider = slugify(fields.provider)
  const amount   = Number(fields.amount).toFixed(2)
  const shortId  = expenseId.slice(0, 8)
  return `${businessId}/${year}/${provider}/${fields.date}_${amount}_${shortId}.${extFor(file)}`
}

async function uploadInvoiceFile(supabase, path, file) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    Sentry.captureException(error, { tags: { event: 'expense_file_upload_failed' } })
    return null
  }
  return path
}

async function deleteInvoiceFile(supabase, path) {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

export async function analizarFactura(_, formData) {
  // Gate de autorización: este action llama a la API de pago de Anthropic.
  // Sin esto, cualquier usuario autenticado (cliente/empleado) podría invocarlo
  // y quemar créditos de Claude. Mismo patrón que crearGasto/actualizarGasto.
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }

  const file = formData.get('factura')
  if (!file || file.size === 0) return { error: 'No se ha seleccionado ningún archivo.' }

  const mimeType = file.type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  if (!allowed.includes(mimeType)) return { error: 'Formato no soportado. Usa JPG, PNG, WEBP o PDF.' }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  const contentBlock = mimeType === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image',    source: { type: 'base64', media_type: mimeType, data: base64 } }

  try {
    const client = new Anthropic()
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: [contentBlock, { type: 'text', text: PROMPT_OCR }] }],
    })

    const text = response.content[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return { error: 'La IA no devolvió datos estructurados. Inténtalo de nuevo.' }

    const data = JSON.parse(match[0])
    return { data }
  } catch (e) {
    Sentry.captureException(e, {
      tags: { event: 'ocr_factura_failed', source: 'gastos_analizar' },
      extra: { mimeType, fileSize: file.size },
    })
    console.error({
      event: 'ocr_factura_failed',
      source: 'gastos_analizar',
      mimeType,
      fileSize: file.size,
      error: e.message,
    })
    return { error: 'Error al analizar la factura. Comprueba la API key y vuelve a intentarlo.' }
  }
}

function readGastoFields(formData) {
  const fields = {
    date:           formData.get('date'),
    category:       formData.get('category'),
    amount:         parseFloat(formData.get('amount')),
    iva_rate:       parseInt(formData.get('iva_rate'), 10),
    description:    formData.get('description')?.trim(),
    provider:       formData.get('provider')?.trim() || null,
    invoice_number: formData.get('invoice_number')?.trim() || null,
    payment_method: formData.get('payment_method'),
    notes:          formData.get('notes')?.trim() || null,
  }
  if (!fields.date || !fields.category || !fields.amount || !fields.description || !fields.payment_method)
    return { error: 'Completa los campos obligatorios.' }
  if (isNaN(fields.amount) || fields.amount <= 0)
    return { error: 'El importe debe ser mayor que 0.' }
  return { fields }
}

// Cuando invoice_number es null el índice UNIQUE parcial no actúa, así que
// comprobamos manualmente que no haya otro gasto con (provider, date, amount)
// idénticos. excludeId permite a actualizarGasto saltarse a sí mismo.
async function findLooseDuplicate(supabase, businessId, fields, excludeId = null) {
  if (fields.invoice_number || !fields.provider) return null
  let q = supabase
    .from('expenses')
    .select('id')
    .eq('business_id', businessId)
    .eq('provider', fields.provider)
    .eq('date', fields.date)
    .eq('amount', fields.amount)
  if (excludeId) q = q.neq('id', excludeId)
  const { data } = await q.maybeSingle()
  return data
}

export async function crearGasto(_, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }
  const { supabase, businessId } = ctx

  const parsed = readGastoFields(formData)
  if (parsed.error) return { error: parsed.error }
  const { fields } = parsed

  const loose = await findLooseDuplicate(supabase, businessId, fields)
  if (loose) {
    return { error: `Posible duplicado: ya existe un gasto de "${fields.provider}" el ${fields.date} por ${fields.amount} €. Si es realmente distinto, añade un nº de factura para diferenciarlo.` }
  }

  const factura = formData.get('factura')
  const hasFile = factura && typeof factura === 'object' && factura.size > 0

  const expenseId = randomUUID()
  let filePath = null
  if (hasFile) {
    const targetPath = buildInvoicePath(businessId, expenseId, fields, factura)
    filePath = await uploadInvoiceFile(supabase, targetPath, factura)
  }

  const { error: dbError } = await supabase
    .from('expenses')
    .insert({
      id:                expenseId,
      business_id:       businessId,
      ...fields,
      file_storage_path: filePath,
      ocr_model:         hasFile ? OCR_MODEL : null,
      ocr_processed_at:  hasFile ? new Date().toISOString() : null,
    })

  if (dbError) {
    if (filePath) await deleteInvoiceFile(supabase, filePath)
    if (dbError.code === '23505') {
      return { error: `Ya existe un gasto del proveedor "${fields.provider}" con el número de factura "${fields.invoice_number}". Revisa el listado o cambia el número.` }
    }
    Sentry.captureException(dbError, { tags: { event: 'expense_create_failed' } })
    return { error: 'Error al guardar el gasto.' }
  }
  redirect(`/app/${ctx.slug}/admin/contabilidad/gastos`)
}

export async function actualizarGasto(id, _, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }
  const { supabase, businessId } = ctx

  const parsed = readGastoFields(formData)
  if (parsed.error) return { error: parsed.error }
  const { fields } = parsed

  const loose = await findLooseDuplicate(supabase, businessId, fields, id)
  if (loose) {
    return { error: `Posible duplicado: ya existe otro gasto de "${fields.provider}" el ${fields.date} por ${fields.amount} €. Añade un nº de factura para diferenciarlo.` }
  }

  const { error: dbError } = await supabase
    .from('expenses')
    .update(fields)
    .eq('id', id)
    .eq('business_id', businessId)

  if (dbError) {
    if (dbError.code === '23505') {
      return { error: `Ya existe otro gasto del proveedor "${fields.provider}" con el número de factura "${fields.invoice_number}".` }
    }
    Sentry.captureException(dbError, { tags: { event: 'expense_update_failed' } })
    return { error: 'Error al actualizar el gasto.' }
  }
  redirect(`/app/${ctx.slug}/admin/contabilidad/gastos`)
}

export async function eliminarGasto(id) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado' }
  const { supabase, businessId } = ctx

  const { data: gasto } = await supabase
    .from('expenses')
    .select('file_storage_path')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  const { error: dbError } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  if (dbError) return { error: 'Error al eliminar el gasto.' }
  if (gasto?.file_storage_path) await deleteInvoiceFile(supabase, gasto.file_storage_path)
  return { ok: true }
}
