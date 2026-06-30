import { redirect } from 'next/navigation'
import { getAdminPageCtx, getAdminStats } from '@/lib/admin-context'
import AdminSidebar from '@/components/AdminSidebar'

export const metadata = {
  title: 'Panel Admin',
}

export default async function AdminLayout({ children, params }) {
  const { slug } = await params
  const { profile, businessId, slug: ctxSlug } = await getAdminPageCtx()

  if (profile?.role !== 'admin') redirect(`/app/${slug}/empleado`)

  // Guard: el slug de la URL debe coincidir con el tenant del usuario logueado
  if (ctxSlug && ctxSlug !== slug) redirect(`/app/${ctxSlug}/admin`)

  const stats = await getAdminStats(businessId)

  return (
    <div className="admin-layout flex min-h-screen bg-gray-100">
      <AdminSidebar
        slug={slug}
        pendingCount={stats.pendingServices ?? 0}
        vacationPendingCount={stats.vacacionesPendientes ?? 0}
      />
      <main className="flex-1 md:ml-64 min-w-0 p-4 md:p-8 pt-14 md:pt-8">
        {children}
      </main>
    </div>
  )
}
