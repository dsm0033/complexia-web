import { ChecklistForm } from '../_components/ChecklistForm'
import { crearChecklist } from '../actions'

export const metadata = { title: 'Nuevo checklist · Admin IMPECABLE' }

export default function NuevoChecklistPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo checklist</h1>
        <p className="text-gray-500 mt-1">Crea un checklist de pasos para un servicio</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ChecklistForm action={crearChecklist} submitLabel="Crear checklist" />
      </div>
    </div>
  )
}
