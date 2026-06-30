'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAdminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()
  return { supabase, businessId: profile?.business_id }
}

export async function guardarContrato(employeeId, prevState, formData) {
  const { supabase, businessId } = await getAdminContext()

  const contract_type      = formData.get('contract_type')
  const start_date         = formData.get('start_date')
  const end_date           = formData.get('end_date') || null
  const gross_annual       = parseFloat(formData.get('gross_annual'))
  const num_payments       = parseInt(formData.get('num_payments'))
  const weekly_hours       = parseFloat(formData.get('weekly_hours'))
  const contribution_group = parseInt(formData.get('contribution_group'))
  const category           = formData.get('category') || null
  const irpf_rate          = parseFloat(formData.get('irpf_rate') || '0')
  const dni                = formData.get('dni') || null
  const ss_affiliation     = formData.get('ss_affiliation') || null

  if (!start_date)                      return { error: 'La fecha de inicio es obligatoria.' }
  if (!gross_annual || gross_annual <= 0) return { error: 'El salario bruto debe ser mayor que 0.' }
  if (weekly_hours <= 0 || weekly_hours > 37.5) return { error: 'Las horas semanales deben estar entre 1 y 37,5.' }
  if (end_date && end_date < start_date) return { error: 'La fecha de fin no puede ser anterior a la de inicio.' }

  // Archivar contrato activo anterior (historial)
  await supabase
    .from('employee_contracts')
    .update({ active: false })
    .eq('employee_id', employeeId)
    .eq('business_id', businessId)
    .eq('active', true)

  const { error } = await supabase
    .from('employee_contracts')
    .insert({
      employee_id: employeeId,
      business_id: businessId,
      contract_type,
      start_date,
      end_date,
      gross_annual,
      num_payments,
      weekly_hours,
      contribution_group,
      category,
      irpf_rate,
      dni,
      ss_affiliation,
      active: true,
    })

  if (error) return { error: 'No se pudo guardar el contrato.' }
  revalidatePath(`/app/${ctx.slug}/admin/empleados/${employeeId}/contrato`)
  return { ok: true }
}
