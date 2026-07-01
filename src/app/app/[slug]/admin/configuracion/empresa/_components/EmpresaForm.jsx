'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </button>
  )
}

const Field = ({ label, name, defaultValue, placeholder, hint, type = 'text', required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
      {!required && <span className="text-gray-400 font-normal"> (opcional)</span>}
    </label>
    <input
      name={name}
      type={type}
      defaultValue={defaultValue ?? ''}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
)

export default function EmpresaForm({ action, data }) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Datos guardados correctamente.
        </div>
      )}

      <Field label="Nombre de la empresa" name="name" defaultValue={data?.name} placeholder="LA IMPECABLE" required />
      <Field label="Eslogan" name="tagline" defaultValue={data?.tagline} placeholder="Cuidado Profesional del Vehículo" hint="Aparece bajo el nombre en las facturas y nóminas." />
      <Field label="NIF / CIF" name="nif" defaultValue={data?.nif} placeholder="B-12345678" hint="Número de Identificación Fiscal de la empresa." />
      <Field label="CCC" name="ccc" defaultValue={data?.ccc} placeholder="28 1234567890" hint="Código Cuenta de Cotización de la Seguridad Social. Aparece en las nóminas." />
      <Field label="Dirección" name="address" defaultValue={data?.address} placeholder="C/ Ejemplo, 1" hint="Calle y número. El código postal, la ciudad y la provincia van en sus propios campos." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Código postal" name="postal_code" defaultValue={data?.postal_code} placeholder="11540" />
        <Field label="Ciudad" name="city" defaultValue={data?.city} placeholder="Sanlúcar de Barrameda" />
        <Field label="Provincia" name="province" defaultValue={data?.province} placeholder="Cádiz" />
      </div>
      <Field label="Email" name="email" type="email" defaultValue={data?.email} placeholder="info@tuempresa.es" />
      <Field label="Teléfono" name="phone" defaultValue={data?.phone} placeholder="600 000 000" />

      <SubmitBtn />
    </form>
  )
}
