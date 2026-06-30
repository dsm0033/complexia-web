'use client'

import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'

const COLORS = ['#3b82f6','#6366f1','#8b5cf6','#10b981','#f59e0b','#f43f5e']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700">{d.nombre}</p>
      <p className="text-blue-600 font-medium mt-1">{d.completados} servicios completados</p>
      {d.tiempoMedio !== null && (
        <p className="text-gray-500 mt-0.5">{d.tiempoMedio} min de media</p>
      )}
    </div>
  )
}

export function EmpleadosChart({ data }) {
  if (!data.length) return <p className="text-sm text-gray-400 py-8 text-center">Sin datos de empleados</p>
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#374151' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
        <Bar dataKey="completados" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
