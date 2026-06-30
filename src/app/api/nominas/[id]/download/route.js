import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  // La RLS de payslips filtra automáticamente:
  // admin ve todas las de su negocio, empleado solo las suyas
  const { data: payslip } = await supabase
    .from('payslips')
    .select('file_path, month')
    .eq('id', id)
    .single()

  if (!payslip) return NextResponse.json({ error: 'Nómina no encontrada.' }, { status: 404 })

  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data } = await adminDb.storage
    .from('nominas')
    .createSignedUrl(payslip.file_path, 60) // URL válida 60 segundos

  if (!data?.signedUrl)
    return NextResponse.json({ error: 'Error al generar el enlace de descarga.' }, { status: 500 })

  return NextResponse.redirect(data.signedUrl)
}
