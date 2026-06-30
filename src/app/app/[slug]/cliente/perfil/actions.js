'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function actualizarPerfil(prevState, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const full_name = formData.get('full_name')?.toString().trim()
  const phone = formData.get('phone')?.toString().trim()

  if (!full_name) return { error: 'El nombre es obligatorio' }

  const { error } = await supabase
    .from('customers')
    .update({ full_name, phone: phone || null })
    .eq('auth_user_id', user.id)

  if (error) return { error: 'No se pudieron guardar los cambios' }

  const { data: customer } = await supabase
    .from('customers')
    .select('businesses(slug)')
    .eq('auth_user_id', user.id)
    .single()
  const slug = customer?.businesses?.slug ?? null
  if (slug) revalidatePath(`/app/${slug}/cliente/perfil`)

  return { success: true }
}
