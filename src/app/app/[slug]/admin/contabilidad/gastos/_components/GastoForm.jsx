'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

const CATEGORIAS = [
  { value: 'suministros',        label: 'Suministros' },
  { value: 'alquiler',           label: 'Alquiler' },
  { value: 'nominas',            label: 'Nóminas' },
  { value: 'material',           label: 'Material' },
  { value: 'publicidad',         label: 'Publicidad' },
  { value: 'mantenimiento_web',  label: 'Mantenimiento web' },
  { value: 'ia',                 label: 'IA' },
  { value: 'otros',              label: 'Otros' },
]

const METODOS_PAGO = [
  { value: 'efectivo',     label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'bizum',        label: 'Bizum' },
  { value: 'tarjeta',      label: 'Tarjeta' },
]

const IVA_OPTIONS = [
  { value: 0,  label: '0% (exento)' },
  { value: 4,  label: '4% (superreducido)' },
  { value: 10, label: '10% (reducido)' },
  { value: 21, label: '21% (general)' },
]

// Campos que la IA puede dejar vacíos y conviene resaltar para revisión humana.
const OCR_REVIEW_FIELDS = ['date', 'amount', 'iva_rate', 'provider', 'invoice_number', 'category', 'description']

function SubmitBtn({ label }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Guardando...' : label}
    </button>
  )
}

export function GastoForm({
  action,
  initialData,
  submitLabel,
  cancelHref = '/admin/contabilidad/gastos',
  attachedFile = null,
}) {
  const [state, formAction] = useActionState(action, null)
  const fileRef = useRef(null)

  // Inyecta el File optimizado del OCR en el input hidden para que viaje
  // dentro del mismo FormData que el resto de campos.
  useEffect(() => {
    if (attachedFile && fileRef.current) {
      const dt = new DataTransfer()
      dt.items.add(attachedFile)
      fileRef.current.files = dt.files
    }
  }, [attachedFile])

  const fromOcr = Boolean(attachedFile)
  const nullFields = fromOcr
    ? OCR_REVIEW_FIELDS.filter(f => initialData?.[f] === null || initialData?.[f] === undefined)
    : []

  const flagClass = (field) =>
    fromOcr && (initialData?.[field] === null || initialData?.[field] === undefined)
      ? 'border-amber-300 bg-amber-50 focus:ring-amber-500'
      : 'border-gray-200 focus:ring-blue-500'

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {attachedFile && (
        <input ref={fileRef} type="file" name="factura" className="hidden" />
      )}

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {fromOcr && nullFields.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            La IA no pudo extraer {nullFields.length === 1 ? 'un campo' : `${nullFields.length} campos`}.
            Revisa los marcados en ámbar antes de guardar.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            name="date"
            type="date"
            defaultValue={initialData?.date ?? new Date().toISOString().slice(0, 10)}
            required
            onClick={e => e.currentTarget.showPicker?.()}
            onFocus={e => e.currentTarget.showPicker?.()}
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${flagClass('date')}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            defaultValue={initialData?.category ?? 'otros'}
            required
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${flagClass('category')}`}
          >
            {CATEGORIAS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <input
          name="description"
          defaultValue={initialData?.description ?? ''}
          required
          placeholder="Ej: Compra de productos de limpieza"
          className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${flagClass('description')}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor
          </label>
          <input
            name="provider"
            defaultValue={initialData?.provider ?? ''}
            placeholder="Ej: Amazon, El Corte Inglés..."
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${flagClass('provider')}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nº de factura
          </label>
          <input
            name="invoice_number"
            defaultValue={initialData?.invoice_number ?? ''}
            placeholder="Ej: F-2026/001"
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${flagClass('invoice_number')}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importe total (€) <span className="text-red-500">*</span>
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={initialData?.amount ?? ''}
            required
            placeholder="0.00"
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${flagClass('amount')}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IVA <span className="text-red-500">*</span>
          </label>
          <select
            name="iva_rate"
            defaultValue={initialData?.iva_rate ?? 21}
            required
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${flagClass('iva_rate')}`}
          >
            {IVA_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Método de pago <span className="text-red-500">*</span>
          </label>
          <select
            name="payment_method"
            defaultValue={initialData?.payment_method ?? 'transferencia'}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {METODOS_PAGO.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          name="notes"
          defaultValue={initialData?.notes ?? ''}
          rows={3}
          placeholder="Información adicional sobre el gasto..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SubmitBtn label={submitLabel} />
        <a href={cancelHref} className="text-sm text-gray-500 hover:text-gray-700">
          Cancelar
        </a>
      </div>
    </form>
  )
}
