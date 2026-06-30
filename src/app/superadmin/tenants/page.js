import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanSelector, ActiveToggle } from './_components/TenantActions'

async function getTenants(supabase) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, email, plan, active, trial_ends_at, features, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function TenantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'superadmin') redirect('/login')

  const tenants = await getTenants(supabase)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tenants</h1>
        <p className="text-gray-400 text-sm mt-1">{tenants.length} negocio{tenants.length !== 1 ? 's' : ''} registrado{tenants.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Negocio</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Trial hasta</th>
              <th className="text-left px-4 py-3">Features</th>
              <th className="text-left px-4 py-3">Alta</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{t.name}</td>
                <td className="px-4 py-3 text-gray-400">{t.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <PlanSelector businessId={t.id} currentPlan={t.plan} />
                </td>
                <td className="px-4 py-3">
                  <ActiveToggle businessId={t.id} active={t.active} />
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(t.trial_ends_at)}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  {Object.keys(t.features ?? {}).length > 0
                    ? JSON.stringify(t.features)
                    : '{}'}
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(t.created_at)}</td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay tenants registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
