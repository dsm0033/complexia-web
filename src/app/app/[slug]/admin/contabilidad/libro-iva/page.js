import { getAdminPageCtx } from '@/lib/admin-context'
import { TrendingUp, TrendingDown, Scale, FileText, Receipt, Info } from 'lucide-react'
import TrimestreSelector from './_components/TrimestreSelector'

export const metadata = { title: 'Libro de IVA · Admin IMPECABLE' }

const CATEGORIAS = {
  suministros: 'Suministros', alquiler: 'Alquiler', nominas: 'Nóminas',
  material: 'Material', publicidad: 'Publicidad', mantenimiento_web: 'Mantenimiento web',
  ia: 'IA', otros: 'Otros',
}

const TRIMESTRES = {
  1: { label: 'T1', meses: 'Enero – Marzo',       inicio: '01-01', fin: '03-31' },
  2: { label: 'T2', meses: 'Abril – Junio',       inicio: '04-01', fin: '06-30' },
  3: { label: 'T3', meses: 'Julio – Septiembre',  inicio: '07-01', fin: '09-30' },
  4: { label: 'T4', meses: 'Octubre – Diciembre', inicio: '10-01', fin: '12-31' },
}

const fmt = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
const round2 = n => Math.round(n * 100) / 100
const fechaCorta = iso => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function trimestreActual() {
  const hoy = new Date()
  return { year: hoy.getFullYear(), trimestre: Math.floor(hoy.getMonth() / 3) + 1 }
}

export default async function LibroIvaPage({ searchParams }) {
  const params = await searchParams
  const def = trimestreActual()

  const year = parseInt(params.year) || def.year
  const trimParam = parseInt(params.trimestre)
  const trimestre = [1, 2, 3, 4].includes(trimParam) ? trimParam : def.trimestre
  const t = TRIMESTRES[trimestre]
  const inicio = `${year}-${t.inicio}`
  const fin = `${year}-${t.fin}`

  // Años disponibles en el selector: desde 2026 (inicio del negocio) hasta hoy,
  // más el año seleccionado por si se navega fuera del rango.
  const years = Array.from(
    new Set([year, def.year, ...Array.from({ length: def.year - 2026 + 1 }, (_, i) => 2026 + i)])
  ).sort((a, b) => b - a)

  const { supabase, businessId } = await getAdminPageCtx()

  const [{ data: invoices }, { data: expenses }] = await Promise.all([
    supabase
      .from('invoices')
      .select('invoice_number, invoice_date, customer_name, service_name, base_amount, iva_amount, total_amount')
      .eq('business_id', businessId)
      .gte('invoice_date', inicio)
      .lte('invoice_date', fin)
      .order('invoice_date'),
    supabase
      .from('expenses')
      .select('date, category, description, provider, amount, iva_rate')
      .eq('business_id', businessId)
      .gte('date', inicio)
      .lte('date', fin)
      .order('date'),
  ])

  // ── IVA repercutido (facturas emitidas) — base e IVA ya desglosados en BD ──
  const ventas = (invoices ?? []).map(f => ({
    ...f,
    base: round2(Number(f.base_amount)),
    cuota: round2(Number(f.iva_amount)),
    total: Number(f.total_amount),
  }))
  const baseRepercutida = round2(ventas.reduce((s, v) => s + v.base, 0))
  const ivaRepercutido = round2(ventas.reduce((s, v) => s + v.cuota, 0))

  // ── IVA soportado (gastos) — amount es el TOTAL con IVA incluido ──
  const compras = (expenses ?? []).map(e => {
    const total = Number(e.amount)
    const r = Number(e.iva_rate)
    const base = r > 0 ? round2(total / (1 + r / 100)) : total
    const cuota = round2(total - base)   // base + cuota = total exacto por línea
    return { ...e, total, base, cuota, r }
  })
  const baseSoportada = round2(compras.reduce((s, c) => s + c.base, 0))
  const ivaSoportado = round2(compras.reduce((s, c) => s + c.cuota, 0))

  // Desglose de soportado por tipo de IVA (las líneas suman los totales)
  const porTipo = {}
  compras.forEach(c => {
    porTipo[c.r] ??= { base: 0, cuota: 0, n: 0 }
    porTipo[c.r].base = round2(porTipo[c.r].base + c.base)
    porTipo[c.r].cuota = round2(porTipo[c.r].cuota + c.cuota)
    porTipo[c.r].n++
  })
  const tiposSoportado = Object.entries(porTipo)
    .map(([r, v]) => ({ r: Number(r), ...v }))
    .sort((a, b) => b.r - a.r)

  const resultado = round2(ivaRepercutido - ivaSoportado)
  const aIngresar = resultado >= 0

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Libro de IVA</h1>
          <p className="text-gray-500 mt-1">
            {t.label} {year} · {t.meses}
          </p>
        </div>
        <TrimestreSelector year={year} trimestre={trimestre} years={years} />
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="inline-flex p-2.5 rounded-lg bg-emerald-50 text-emerald-600 mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{fmt(ivaRepercutido)}</p>
          <p className="text-sm text-gray-500 mt-1">IVA repercutido</p>
          <p className="text-xs text-gray-400 mt-1">{ventas.length} factura{ventas.length !== 1 ? 's' : ''} emitida{ventas.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="inline-flex p-2.5 rounded-lg bg-rose-50 text-rose-600 mb-4">
            <TrendingDown size={20} />
          </div>
          <p className="text-2xl font-bold text-rose-700">{fmt(ivaSoportado)}</p>
          <p className="text-sm text-gray-500 mt-1">IVA soportado</p>
          <p className="text-xs text-gray-400 mt-1">{compras.length} gasto{compras.length !== 1 ? 's' : ''} registrado{compras.length !== 1 ? 's' : ''}</p>
        </div>

        <div className={`rounded-xl border p-6 ${aIngresar ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className={`inline-flex p-2.5 rounded-lg mb-4 ${aIngresar ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <Scale size={20} />
          </div>
          <p className={`text-2xl font-bold ${aIngresar ? 'text-blue-700' : 'text-emerald-700'}`}>
            {fmt(Math.abs(resultado))}
          </p>
          <p className="text-sm text-gray-500 mt-1">{aIngresar ? 'Resultado a ingresar' : 'A compensar / devolver'}</p>
          <p className="text-xs text-gray-400 mt-1">repercutido − soportado</p>
        </div>
      </div>

      {/* Resumen modelo 303 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Resumen del trimestre (preparación modelo 303)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Concepto</th>
                <th className="py-2 px-4 font-medium text-right">Base imponible</th>
                <th className="py-2 px-4 font-medium text-right">Tipo</th>
                <th className="py-2 pl-4 font-medium text-right">Cuota IVA</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {/* IVA devengado */}
              <tr className="border-b border-gray-50">
                <td className="py-2 pr-4 font-semibold text-gray-800" colSpan={4}>IVA devengado (ventas)</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-2 pr-4 pl-4">Facturas emitidas</td>
                <td className="py-2 px-4 text-right">{fmt(baseRepercutida)}</td>
                <td className="py-2 px-4 text-right text-gray-400">21 %</td>
                <td className="py-2 pl-4 text-right font-medium text-emerald-700">{fmt(ivaRepercutido)}</td>
              </tr>

              {/* IVA deducible */}
              <tr className="border-b border-gray-50">
                <td className="py-2 pr-4 font-semibold text-gray-800 pt-4" colSpan={4}>IVA deducible (gastos)</td>
              </tr>
              {tiposSoportado.length === 0 && (
                <tr className="border-b border-gray-50">
                  <td className="py-2 pr-4 pl-4 text-gray-400" colSpan={4}>Sin gastos en el trimestre</td>
                </tr>
              )}
              {tiposSoportado.map(({ r, base, cuota }) => (
                <tr key={r} className="border-b border-gray-50">
                  <td className="py-2 pr-4 pl-4">Gastos al {r} %</td>
                  <td className="py-2 px-4 text-right">{fmt(base)}</td>
                  <td className="py-2 px-4 text-right text-gray-400">{r} %</td>
                  <td className="py-2 pl-4 text-right font-medium text-rose-700">{fmt(cuota)}</td>
                </tr>
              ))}

              {/* Resultado */}
              <tr className="border-t-2 border-gray-200">
                <td className="py-3 pr-4 font-bold text-gray-900" colSpan={3}>
                  {aIngresar ? 'Resultado a ingresar' : 'Resultado a compensar / devolver'}
                </td>
                <td className={`py-3 pl-4 text-right font-bold ${aIngresar ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {fmt(Math.abs(resultado))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <span>
            Resumen orientativo para preparar el modelo 303. No contempla operaciones intracomunitarias,
            inversión del sujeto pasivo, recargo de equivalencia ni IVA no deducible. Revísalo con tu gestoría
            antes de presentarlo.
          </span>
        </div>
      </div>

      {/* Detalle IVA repercutido */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText size={18} className="text-emerald-600" />
          <h2 className="text-base font-semibold text-gray-800">IVA repercutido · facturas emitidas</h2>
        </div>
        {ventas.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Sin facturas emitidas en este trimestre</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-50">
                  <th className="py-2 px-4 font-medium">Nº factura</th>
                  <th className="py-2 px-4 font-medium">Fecha</th>
                  <th className="py-2 px-4 font-medium">Cliente</th>
                  <th className="py-2 px-4 font-medium text-right">Base</th>
                  <th className="py-2 px-4 font-medium text-right">IVA</th>
                  <th className="py-2 px-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {ventas.map(v => (
                  <tr key={v.invoice_number} className="border-t border-gray-50">
                    <td className="py-2 px-4 font-medium text-gray-900">{v.invoice_number}</td>
                    <td className="py-2 px-4">{fechaCorta(v.invoice_date)}</td>
                    <td className="py-2 px-4">{v.customer_name || '—'}</td>
                    <td className="py-2 px-4 text-right">{fmt(v.base)}</td>
                    <td className="py-2 px-4 text-right">{fmt(v.cuota)}</td>
                    <td className="py-2 px-4 text-right font-medium">{fmt(v.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold text-gray-900">
                  <td className="py-2 px-4" colSpan={3}>Total</td>
                  <td className="py-2 px-4 text-right">{fmt(baseRepercutida)}</td>
                  <td className="py-2 px-4 text-right text-emerald-700">{fmt(ivaRepercutido)}</td>
                  <td className="py-2 px-4 text-right">{fmt(round2(baseRepercutida + ivaRepercutido))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Detalle IVA soportado */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Receipt size={18} className="text-rose-600" />
          <h2 className="text-base font-semibold text-gray-800">IVA soportado · gastos</h2>
        </div>
        {compras.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Sin gastos en este trimestre</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-50">
                  <th className="py-2 px-4 font-medium">Fecha</th>
                  <th className="py-2 px-4 font-medium">Descripción</th>
                  <th className="py-2 px-4 font-medium">Proveedor</th>
                  <th className="py-2 px-4 font-medium text-right">Base</th>
                  <th className="py-2 px-4 font-medium text-right">Tipo</th>
                  <th className="py-2 px-4 font-medium text-right">IVA</th>
                  <th className="py-2 px-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {compras.map((c, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="py-2 px-4">{fechaCorta(c.date)}</td>
                    <td className="py-2 px-4">
                      {c.description}
                      <span className="text-gray-400"> · {CATEGORIAS[c.category] ?? c.category}</span>
                    </td>
                    <td className="py-2 px-4">{c.provider || '—'}</td>
                    <td className="py-2 px-4 text-right">{fmt(c.base)}</td>
                    <td className="py-2 px-4 text-right text-gray-400">{c.r} %</td>
                    <td className="py-2 px-4 text-right">{fmt(c.cuota)}</td>
                    <td className="py-2 px-4 text-right font-medium">{fmt(c.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold text-gray-900">
                  <td className="py-2 px-4" colSpan={3}>Total</td>
                  <td className="py-2 px-4 text-right">{fmt(baseSoportada)}</td>
                  <td className="py-2 px-4"></td>
                  <td className="py-2 px-4 text-right text-rose-700">{fmt(ivaSoportado)}</td>
                  <td className="py-2 px-4 text-right">{fmt(round2(baseSoportada + ivaSoportado))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
