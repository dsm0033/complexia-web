'use client'

import { useState, useEffect, useTransition } from 'react'
import { cambiarPlan, toggleActivo } from '../actions'

const PLANES = ['free', 'basic', 'pro']

export function PlanSelector({ businessId, currentPlan }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [localPlan, setLocalPlan] = useState(currentPlan)

  // Sincroniza si el servidor revalida y devuelve un plan distinto
  useEffect(() => {
    setLocalPlan(currentPlan)
  }, [currentPlan])

  function handleChange(e) {
    const plan = e.target.value
    setLocalPlan(plan)
    setError(null)
    startTransition(async () => {
      const result = await cambiarPlan(businessId, plan)
      if (result.error) {
        setError(result.error)
        setLocalPlan(currentPlan) // revierte al valor del servidor
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={localPlan}
        onChange={handleChange}
        disabled={pending}
        className="bg-gray-800 border border-gray-600 text-gray-100 text-sm rounded px-2 py-1 disabled:opacity-50"
      >
        {PLANES.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}

export function ActiveToggle({ businessId, active }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [localActive, setLocalActive] = useState(active)

  // Sincroniza si el servidor revalida y devuelve un estado distinto
  useEffect(() => {
    setLocalActive(active)
  }, [active])

  function handleClick() {
    const next = !localActive
    setLocalActive(next) // feedback optimista inmediato
    setError(null)
    startTransition(async () => {
      const result = await toggleActivo(businessId, next)
      if (result.error) {
        setError(result.error)
        setLocalActive(localActive) // revierte al estado anterior
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={pending}
        className={`px-3 py-1 text-xs rounded font-medium transition-colors disabled:opacity-50 ${
          localActive
            ? 'bg-green-800 text-green-200 hover:bg-red-800 hover:text-red-200'
            : 'bg-red-800 text-red-200 hover:bg-green-800 hover:text-green-200'
        }`}
      >
        {pending ? '...' : localActive ? 'Activo' : 'Suspendido'}
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}
