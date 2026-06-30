import { EmpleadoForm } from '../_components/EmpleadoForm'
import { crearEmpleado } from '../actions'

export const metadata = { title: 'Nuevo empleado · Admin IMPECABLE' }

export default async function NuevoEmpleadoPage({ params }) {
  const { slug } = await params
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo empleado</h1>
        <p className="text-gray-500 mt-1">Añade los datos del empleado</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <EmpleadoForm action={crearEmpleado} submitLabel="Crear empleado" slug={slug} />
      </div>
    </div>
  )
}
