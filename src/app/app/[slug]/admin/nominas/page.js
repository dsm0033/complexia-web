import { getAdminPageCtx } from '@/lib/admin-context'
import { FileSpreadsheet } from 'lucide-react'
import { calcularNomina } from '@/lib/payroll'
import MesSelector from './_components/MesSelector'
import { NominasTable } from './_components/NominasTable'

export const metadata = { title: 'Nóminas · Admin IMPECABLE' }

const fmt = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

export default async function NominasPage({ searchParams }) {
  const sp = await searchParams
  const hoy = new Date()
  const mes = sp.mes || `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const year = parseInt(mes.split('-')[0])

  const { supabase, businessId, slug } = await getAdminPageCtx()

  const [
    { data: empleados },
    { data: contratos },
    { data: ssRates },
    { data: irpfBrackets },
    { data: settingsRows },
  ] = await Promise.all([
    supabase
      .from('employees')
      .select('id, full_name, position')
      .eq('business_id', businessId)
      .eq('active', true)
      .order('full_name'),
    supabase
      .from('employee_contracts')
      .select('*')
      .eq('business_id', businessId)
      .eq('active', true),
    supabase
      .from('ss_rates')
      .select('concept, worker_rate, company_rate')
      .eq('year', year),
    supabase
      .from('irpf_brackets')
      .select('min_income, max_income, rate')
      .eq('year', year),
    supabase
      .from('payroll_settings')
      .select('key, value')
      .eq('year', year),
  ])

  const settings = Object.fromEntries((settingsRows ?? []).map(r => [r.key, r.value]))
  const contratosPorEmpleado = Object.fromEntries((contratos ?? []).map(c => [c.employee_id, c]))

  const conContrato = []
  const sinContrato = []

  for (const emp of empleados ?? []) {
    const contrato = contratosPorEmpleado[emp.id]
    if (!contrato) {
      sinContrato.push(emp)
      continue
    }
    const calculo = calcularNomina({ contract: contrato, ssRates: ssRates ?? [], irpfBrackets: irpfBrackets ?? [], settings, mes })
    conContrato.push({ ...emp, contrato, calculo })
  }

  const totales = conContrato.reduce(
    (acc, { calculo: c }) => ({
      bruto:   acc.bruto   + c.brutoMensual,
      ss:      acc.ss      + c.deduccionSS,
      irpf:    acc.irpf    + c.deduccionIRPF,
      neto:    acc.neto    + c.neto,
      empresa: acc.empresa + c.costeEmpresa,
    }),
    { bruto: 0, ss: 0, irpf: 0, neto: 0, empresa: 0 }
  )

  const sinDatos = ssRates?.length === 0 || irpfBrackets?.length === 0

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nóminas</h1>
          <p className="text-gray-500 mt-1">{conContrato.length} empleado{conContrato.length !== 1 ? 's' : ''} con contrato activo</p>
        </div>
        <MesSelector value={mes} />
      </div>

      {/* Aviso sin tablas fiscales */}
      {sinDatos && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6 text-sm text-red-800">
          ⚠️ No hay datos fiscales para {year}. Actualiza las tablas de referencia en la BD antes de calcular nóminas.
        </div>
      )}

      {/* Tarjetas resumen */}
      {conContrato.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Masa salarial bruta', value: fmt(totales.bruto) },
            { label: 'Total neto empleados', value: fmt(totales.neto) },
            { label: 'Retenciones IRPF', value: fmt(totales.irpf) },
            { label: 'Coste total empresa', value: fmt(totales.empresa), highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-xl border p-4 ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100 shadow-sm'}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-xl font-bold ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabla de nóminas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {conContrato.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileSpreadsheet size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-lg font-medium">Sin empleados con contrato</p>
            <p className="text-sm mt-1">Asigna un contrato a cada empleado desde su ficha</p>
          </div>
        ) : (
          <NominasTable empleados={conContrato} mes={mes} slug={slug} />
        )}
      </div>

      {/* Empleados sin contrato */}
      {sinContrato.length > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            {sinContrato.length} empleado{sinContrato.length !== 1 ? 's' : ''} sin contrato registrado
          </p>
          <ul className="space-y-1">
            {sinContrato.map(e => (
              <li key={e.id} className="flex items-center justify-between text-sm text-amber-700">
                <span>{e.full_name}</span>
                <a href={`/app/${slug}/admin/empleados/${e.id}/contrato`} className="text-amber-900 font-medium hover:underline">
                  Asignar contrato →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
