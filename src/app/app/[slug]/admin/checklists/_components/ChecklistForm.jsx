'use client'

import { useActionState, useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'

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

export function ChecklistForm({ action, initialData, submitLabel }) {
  const [state, formAction] = useActionState(action, null)
  const [items, setItems] = useState(
    initialData?.items?.map((i) => i.text) ?? []
  )
  const [nuevoItem, setNuevoItem] = useState('')
  const inputRef = useRef(null)

  function addItem() {
    const text = nuevoItem.trim()
    if (!text) return
    setItems([...items, text])
    setNuevoItem('')
    inputRef.current?.focus()
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      <input type="hidden" name="items" value={JSON.stringify(items.map((text) => ({ text })))} />

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          defaultValue={initialData?.name}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ítems <span className="text-red-500">*</span>
        </label>

        {/* Lista de ítems */}
        {items.length > 0 && (
          <ul className="mb-3 space-y-1">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-xs font-mono w-4">{idx + 1}.</span>
                <span className="flex-1 text-sm text-gray-800">{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Añadir ítem */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={nuevoItem}
            onChange={(e) => setNuevoItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un ítem y pulsa Añadir o Enter"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            + Añadir
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SubmitBtn label={submitLabel} />
        <a href="/admin/checklists" className="text-sm text-gray-500 hover:text-gray-700">
          Cancelar
        </a>
      </div>
    </form>
  )
}
