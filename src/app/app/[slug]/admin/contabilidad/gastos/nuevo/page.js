import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { NuevoGastoClient } from '../_components/NuevoGastoClient'

export const metadata = { title: 'Nuevo gasto · Admin IMPECABLE' }

export default async function NuevoGastoPage({ params }) {
  const { slug } = await params
  return (
    <div>
      <Link
        href={`/app/${slug}/admin/contabilidad/gastos`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} />
        Volver a Gastos
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nuevo gasto</h1>

      <NuevoGastoClient slug={slug} />
    </div>
  )
}
