import { ClienteForm } from '../_components/ClienteForm'
import { crearCliente } from '../actions'

export const metadata = { title: 'Nuevo cliente · Admin IMPECABLE' }

export default function NuevoClientePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo cliente</h1>
        <p className="text-gray-500 mt-1">Añade los datos del cliente</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ClienteForm action={crearCliente} submitLabel="Crear cliente" />
      </div>
    </div>
  )
}
