import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Superadmin · ComplexIA',
}

export default async function SuperadminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') redirect('/login')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-white">ComplexIA</span>
          <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded font-medium">
            superadmin
          </span>
        </div>
        <span className="text-sm text-gray-400">{profile?.full_name ?? user.email}</span>
      </header>

      <div className="flex">
        <nav className="w-56 min-h-[calc(100vh-57px)] border-r border-gray-800 p-4">
          <ul className="space-y-1">
            <li>
              <a
                href="/superadmin/tenants"
                className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                Tenants
              </a>
            </li>
          </ul>
        </nav>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
