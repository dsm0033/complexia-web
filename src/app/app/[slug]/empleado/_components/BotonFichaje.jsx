'use client'

import { useState, useEffect } from 'react'
import { Clock, LogIn, LogOut } from 'lucide-react'
import { ficharEntrada, ficharSalida } from '../actions'

function formatElapsed(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`
  if (m > 0) return `${m}min ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

export default function BotonFichaje({ fichajeActivo }) {
  const [elapsed, setElapsed] = useState(() =>
    fichajeActivo
      ? Math.floor((Date.now() - new Date(fichajeActivo.clock_in).getTime()) / 1000)
      : 0
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!fichajeActivo) return
    const interval = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [fichajeActivo])

  async function handleFichar() {
    setLoading(true)
    if (fichajeActivo) {
      await ficharSalida()
    } else {
      await ficharEntrada()
    }
    setLoading(false)
  }

  return (
    <div className="bg-tarjeta border border-borde rounded-xl px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Clock size={20} color={fichajeActivo ? '#22c55e' : '#8A9AAC'} />
        <div>
          {fichajeActivo ? (
            <>
              <p className="text-sm font-medium text-texto">En turno</p>
              <p className="text-xs text-muted">{formatElapsed(elapsed)} desde la entrada</p>
            </>
          ) : (
            <p className="text-sm font-medium text-muted">Sin fichar</p>
          )}
        </div>
      </div>

      <button
        onClick={handleFichar}
        disabled={loading}
        className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
          fichajeActivo
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            : 'bg-dorado/10 text-dorado hover:bg-dorado/20'
        }`}
      >
        {fichajeActivo ? <LogOut size={15} /> : <LogIn size={15} />}
        {fichajeActivo ? 'Fichar salida' : 'Fichar entrada'}
      </button>
    </div>
  )
}
