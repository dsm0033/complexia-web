import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PerfilForm from './_components/PerfilForm'

export const metadata = { title: 'Mi perfil · IMPECABLE' }

export default async function ClientePerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, full_name, email, phone')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/cliente" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3">
          <ArrowLeft size={15} /> Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Tus datos de contacto</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {customer ? (
          <PerfilForm customer={customer} userEmail={user.email} />
        ) : (
          <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4">
            Tu cuenta no está vinculada a ningún perfil de cliente aún. Escríbenos a{' '}
            <a href="mailto:info@laimpecable.es" className="font-medium underline">info@laimpecable.es</a>
            {' '}para gestionarlo.
          </div>
        )}
      </div>
    </div>
  )
}
