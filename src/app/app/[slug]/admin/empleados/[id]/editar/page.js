import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminPageCtx } from '@/lib/admin-context'
import { EmpleadoForm } from '../../_components/EmpleadoForm'
import { editarEmpleado, actualizarIbanAdmin } from '../../actions'
import IbanFormAdmin from '../../_components/IbanFormAdmin'

export const metadata = { title: 'Editar empleado · Admin IMPECABLE' }

export default async function EditarEmpleadoPage({ params }) {
  const { id } = await params
  const { supabase, businessId } = await getAdminPageCtx()

  const { data: empleado } = await supabase
    .from('employees')
    .select('id, full_name, email, phone, position, iban')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (!empleado) notFound()

  const action = editarEmpleado.bind(null, id)

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link
          href="/admin/empleados"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Empleados
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar empleado</h1>
        <p className="text-gray-500 mt-1">{empleado.full_name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <EmpleadoForm action={action} initialData={empleado} submitLabel="Guardar cambios" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Calendario</h2>
            <p className="text-sm text-gray-500 mt-0.5">Días de trabajo, servicios asignados, vacaciones y festivos</p>
          </div>
          <a
            href={`/admin/empleados/${id}/calendario`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver calendario →
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Tiempo de trabajo</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fichajes, horas trabajadas y horario contratado</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/admin/empleados/${id}/horas`}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver horas
            </a>
            <a
              href={`/admin/empleados/${id}/horario`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Configurar horario →
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Contrato</h2>
            <p className="text-sm text-gray-500 mt-0.5">Tipo, salario bruto, jornada, grupo de cotización e IRPF</p>
          </div>
          <a
            href={`/admin/empleados/${id}/contrato`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gestionar contrato →
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Datos bancarios</h2>
        <p className="text-sm text-gray-500 mb-4">IBAN donde se ingresa la nómina. El empleado también puede introducirlo desde su portal.</p>
        <IbanFormAdmin action={actualizarIbanAdmin.bind(null, id)} ibanActual={empleado.iban} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Nóminas</h2>
            <p className="text-sm text-gray-500 mt-0.5">PDFs mensuales accesibles desde el portal del empleado</p>
          </div>
          <a
            href={`/admin/empleados/${id}/nominas`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gestionar nóminas →
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Vacaciones</h2>
            <p className="text-sm text-gray-500 mt-0.5">Días disponibles, solicitudes y aprobaciones</p>
          </div>
          <a
            href={`/admin/empleados/${id}/vacaciones`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gestionar vacaciones →
          </a>
        </div>
      </div>
    </div>
  )
}
