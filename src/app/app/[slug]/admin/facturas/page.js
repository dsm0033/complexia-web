import { Suspense } from 'react'
import Link from 'next/link'
import { getAdminPageCtx } from '@/lib/admin-context'
import { FileText, AlertTriangle } from 'lucide-react'
import { FacturasTable } from './_components/FacturasTable'

export const metadata = { title: 'Facturas · Admin IMPECABLE' }

export default async function AdminFacturasPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const [{ data: facturas }, { data: business }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id, invoice_number, invoice_date, customer_name, customer_email, service_name, base_amount, iva_amount, total_amount, service_record_id, booking_id, customer_id, email_sent_at')
      .eq('business_id', businessId)
      .order('invoice_date', { ascending: true }),
    supabase
      .from('businesses')
      .select('nif, address')
      .eq('id', businessId)
      .maybeSingle(),
  ])

  const total = facturas?.reduce((sum, f) => sum + Number(f.total_amount), 0) ?? 0
  const faltanDatosFiscales = !business?.nif || !business?.address

  return (
    <div>
      {faltanDatosFiscales && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Facturación automática en pausa</p>
            <p className="mt-0.5">
              No se emitirán facturas hasta completar el <strong>NIF</strong> y el <strong>domicilio fiscal</strong> del
              negocio (obligatorios por ley).{' '}
              <Link href="/admin/configuracion/empresa" className="underline font-medium hover:text-amber-900">
                Completar datos de empresa →
              </Link>
            </p>
          </div>
        </div>
      )}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-500 mt-1">{facturas?.length ?? 0} facturas emitidas</p>
        </div>
        {facturas?.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total facturado</p>
            <p className="text-2xl font-bold text-gray-900">{total.toFixed(2)} €</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {!facturas?.length ? (
          <div className="p-12 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-lg font-medium">Sin facturas todavía</p>
            <p className="text-sm mt-1">Se generan automáticamente cuando un cliente descarga su factura</p>
          </div>
        ) : (
          <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando...</div>}>
            <FacturasTable facturas={facturas} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
