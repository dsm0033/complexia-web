// Busca un cliente existente por email o teléfono; si no existe lo crea.
// El email tiene prioridad sobre el teléfono para la búsqueda.
// Si hay conflicto en el INSERT (race condition), recupera el existente.
export async function buscarOCrearCliente(email, phone, name, businessId, db) {
  if (email) {
    const { data: byEmail } = await db
      .from('customers')
      .select('id')
      .eq('email', email)
      .eq('business_id', businessId)
      .maybeSingle()
    if (byEmail) return byEmail.id
  }

  if (phone) {
    const { data: byPhone } = await db
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .eq('business_id', businessId)
      .maybeSingle()
    if (byPhone) return byPhone.id
  }

  if (!email && !phone) return null

  const { data: nuevo, error } = await db
    .from('customers')
    .insert({ business_id: businessId, full_name: name, email: email || null, phone: phone || null })
    .select('id')
    .single()

  if (error) {
    // Conflicto de unique (race condition) — recuperar el existente
    if (email) {
      const { data: existing } = await db.from('customers').select('id').eq('email', email).eq('business_id', businessId).maybeSingle()
      if (existing) return existing.id
    }
    if (phone) {
      const { data: existing } = await db.from('customers').select('id').eq('phone', phone).eq('business_id', businessId).maybeSingle()
      if (existing) return existing.id
    }
    return null
  }

  return nuevo?.id ?? null
}
