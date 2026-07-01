import { getAdminPageCtx } from '@/lib/admin-context'
import { guardarDatosEmpresa } from './actions'
import EmpresaForm from './_components/EmpresaForm'

export const metadata = { title: 'Datos de empresa · Admin IMPECABLE' }

export default async function EmpresaPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: business } = await supabase
    .from('businesses')
    .select('name, nif, ccc, tagline, address, postal_code, city, province, email, phone')
    .eq('id', businessId)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Datos de la empresa</h1>
        <p className="text-gray-500 mt-1">
          Esta información aparece en las facturas y nóminas generadas. Mantenla siempre actualizada.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <EmpresaForm action={guardarDatosEmpresa} data={business} />
      </div>
    </div>
  )
}
