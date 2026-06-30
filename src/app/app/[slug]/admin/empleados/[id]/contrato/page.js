import { notFound } from 'next/navigation'
import { getAdminPageCtx } from '@/lib/admin-context'
import ContratoForm from './_components/ContratoForm'
import { guardarContrato } from './actions'

export const metadata = { title: 'Contrato · Admin IMPECABLE' }

export default async function ContratoPage({ params }) {
  const { id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const year = new Date().getFullYear()

  const [{ data: empleado }, { data: contrato }, { data: grupos }] = await Promise.all([
    supabase
      .from('employees')
      .select('id, full_name')
      .eq('id', id)
      .eq('business_id', businessId)
      .single(),
    supabase
      .from('employee_contracts')
      .select('*')
      .eq('employee_id', id)
      .eq('business_id', businessId)
      .eq('active', true)
      .maybeSingle(),
    supabase
      .from('contribution_groups')
      .select('group_number, name, base_type, min_base')
      .eq('year', year)
      .order('group_number'),
  ])

  if (!empleado) notFound()

  const action = guardarContrato.bind(null, id)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <a href="/admin/empleados" className="hover:text-gray-700">Empleados</a>
          <span>/</span>
          <a href={`/admin/empleados/${id}/editar`} className="hover:text-gray-700">{empleado.full_name}</a>
          <span>/</span>
          <span>Contrato</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/admin/empleados/${id}/editar`}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Volver
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contrato</h1>
            <p className="text-gray-500 mt-1">{empleado.full_name}</p>
          </div>
        </div>
      </div>

      {contrato ? (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-800">
          <span className="mt-0.5">ℹ️</span>
          <span>
            <span className="font-semibold">Contrato activo desde</span>{' '}
            {new Date(contrato.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.
            {' '}Guardar cambios archivará este contrato y creará uno nuevo — el historial se conserva.
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
          <span className="mt-0.5">⚠️</span>
          <span>Este empleado no tiene contrato registrado. Sin contrato no se pueden calcular nóminas.</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ContratoForm action={action} initialData={contrato} grupos={grupos ?? []} />
      </div>
    </div>
  )
}
