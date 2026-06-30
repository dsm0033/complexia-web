'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function MesSelector({ value }) {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <input
      type="month"
      value={value}
      onChange={e => router.push(`${pathname}?mes=${e.target.value}`)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}
