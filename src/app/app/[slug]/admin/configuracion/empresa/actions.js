'use server'

import { revalidatePath } from 'next/cache'
import { getAdminCtx } from '@/lib/admin-context'

export async function guardarDatosEmpresa(prevState, formData) {
  const ctx = await getAdminCtx()
  if (!ctx) return { error: 'No autorizado.' }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      name:    formData.get('name')?.trim()    || null,
      nif:     formData.get('nif')?.trim()     || null,
      ccc:     formData.get('ccc')?.trim()     || null,
      tagline: formData.get('tagline')?.trim() || null,
      address: formData.get('address')?.trim() || null,
      postal_code: formData.get('postal_code')?.trim() || null,
      city:        formData.get('city')?.trim()        || null,
      province:    formData.get('province')?.trim()    || null,
      email:   formData.get('email')?.trim()   || null,
      phone:   formData.get('phone')?.trim()   || null,
    })
    .eq('id', ctx.businessId)

  if (error) return { error: error.message }

  revalidatePath(`/app/${ctx.slug}/admin/configuracion/empresa`)
  return { ok: true }
}
