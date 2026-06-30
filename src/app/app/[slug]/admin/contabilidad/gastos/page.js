import { Suspense } from 'react'
import Link from 'next/link'
import { getAdminPageCtx } from '@/lib/admin-context'
import { Receipt, Plus } from 'lucide-react'
import { GastosTable } from './_components/GastosTable'

export const metadata = { title: 'Gastos · Admin IMPECABLE' }

export default async function AdminGastosPage() {
  const { supabase, businessId, slug } = await getAdminPageCtx()

  const { data: gastos } = await supabase
    .from('expenses')
    .select('id, date, category, amount, iva_rate, description, provider, payment_method, notes')
    .eq('business_id', businessId)
    .order('date', { ascending: false })

  const total = gastos?.reduce((sum, g) => sum + Number(g.amount), 0) ?? 0

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-gray-500 mt-1">{gastos?.length ?? 0} gastos registrados</p>
        </div>
        <div className="flex items-center gap-6">
          {gastos?.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total gastos</p>
              <p className="text-2xl font-bold text-gray-900">{total.toFixed(2)} €</p>
            </div>
          )}
          <Link
            href={`/app/${slug}/admin/contabilidad/gastos/nuevo`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Nuevo gasto
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {!gastos?.length ? (
          <div className="p-12 text-center text-gray-400">
            <Receipt size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-lg font-medium">Sin gastos todavía</p>
            <p className="text-sm mt-1">Registra aquí los gastos del negocio para calcular el P&L</p>
          </div>
        ) : (
          <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando...</div>}>
            <GastosTable gastos={gastos} slug={slug} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
