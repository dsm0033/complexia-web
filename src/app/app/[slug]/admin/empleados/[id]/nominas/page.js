import { notFound } from 'next/navigation'
import { getAdminPageCtx } from '@/lib/admin-context'
import UploadForm from './_components/UploadForm'
import { subirNomina, eliminarNomina } from './actions'

export const metadata = { title: 'Nóminas · Admin IMPECABLE' }

function formatMonth(m) {
  const [y, mo] = m.split('-')
  return new Date(+y, +mo - 1, 1)
    .toLocaleString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

export default async function NominasPage({ params }) {
  const { id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const [{ data: empleado }, { data: payslips }] = await Promise.all([
    supabase
      .from('employees')
      .select('id, full_name')
      .eq('id', id)
      .eq('business_id', businessId)
      .single(),
    supabase
      .from('payslips')
      .select('id, month, uploaded_at')
      .eq('employee_id', id)
      .order('month', { ascending: false }),
  ])

  if (!empleado) notFound()

  const uploadAction = subirNomina.bind(null, id)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <a href="/admin/empleados" className="hover:text-gray-700">Empleados</a>
          <span>/</span>
          <a href={`/admin/empleados/${id}/editar`} className="hover:text-gray-700">{empleado.full_name}</a>
          <span>/</span>
          <span>Nóminas</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/admin/empleados/${id}/editar`}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Volver
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nóminas</h1>
            <p className="text-gray-500 mt-1">{empleado.full_name}</p>
          </div>
        </div>
      </div>

      {/* Subir nueva nómina */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Subir nómina</h2>
        <UploadForm action={uploadAction} />
      </div>

      {/* Listado de nóminas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {!payslips?.length ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No hay nóminas subidas todavía.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {payslips.map(p => {
              const deleteAction = eliminarNomina.bind(null, p.id)
              return (
                <div key={p.id} className="flex items-center justify-between px-6 py-4 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{formatMonth(p.month)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Subida el {new Date(p.uploaded_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={`/api/nominas/${p.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Descargar PDF
                    </a>
                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
