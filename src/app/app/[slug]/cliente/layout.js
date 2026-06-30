import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'
import { LogOut, User, ClipboardList, Calendar } from 'lucide-react'

export default async function ClienteLayout({ children, params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('full_name, business_id, businesses(slug)')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const nombre = customer?.full_name ?? user.email

  // Guard: el slug de la URL debe coincidir con el tenant del cliente logueado
  const ctxSlug = customer?.businesses?.slug ?? null
  if (ctxSlug && ctxSlug !== slug) redirect(`/app/${ctxSlug}/cliente`)

  const base = `/app/${slug}/cliente`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-dorado font-medium uppercase tracking-wider">IMPECABLE</p>
            <p className="font-semibold text-gray-900 text-sm">{nombre}</p>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href={base}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-dorado transition-colors"
            >
              <Calendar size={15} />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            <Link
              href={`${base}/historial`}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-dorado transition-colors"
            >
              <ClipboardList size={15} />
              <span className="hidden sm:inline">Historial</span>
            </Link>
            <Link
              href={`${base}/perfil`}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-dorado transition-colors"
            >
              <User size={15} />
              <span className="hidden sm:inline">Mi perfil</span>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
