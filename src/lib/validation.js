/**
 * Helpers compartidos para validar inputs de server actions.
 *
 * El patrón "if (!campo) return { error: 'X obligatorio' }" se repetía en
 * ~10 actions. Aquí lo centralizamos para que los mensajes sean coherentes
 * y un cambio futuro (i18n, formato de error, etc.) toque un solo sitio.
 */

/**
 * Verifica que todos los campos están presentes en el FormData.
 *
 * @param {FormData} formData
 * @param {Record<string,string>} fields - mapa { nombre_campo: 'mensaje de error' }.
 *   El mensaje se devuelve tal cual cuando ese campo está vacío.
 * @returns {string|null} primer mensaje de error o null si todos OK
 *
 * Uso:
 *   const err = requireFields(formData, {
 *     customer_id: 'Selecciona un cliente',
 *     service_id:  'Selecciona un servicio',
 *     date:        'La fecha es obligatoria',
 *   })
 *   if (err) return { error: err }
 */
export function requireFields(formData, fields) {
  for (const [name, errorMsg] of Object.entries(fields)) {
    const val = formData.get(name)?.toString().trim()
    if (!val) return errorMsg
  }
  return null
}

/**
 * Atajo común: requiere que al menos uno de dos campos esté presente.
 * Útil para "indica email o teléfono" en formularios de contacto.
 *
 * @param {FormData} formData
 * @param {string} fieldA
 * @param {string} fieldB
 * @param {string} errorMsg
 * @returns {string|null}
 */
export function requireOneOf(formData, fieldA, fieldB, errorMsg) {
  const a = formData.get(fieldA)?.toString().trim()
  const b = formData.get(fieldB)?.toString().trim()
  if (!a && !b) return errorMsg
  return null
}
