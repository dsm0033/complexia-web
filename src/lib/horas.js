// Utilidades compartidas para el módulo de horas y fichajes

export function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function minutosEntreFechas(inicio, fin) {
  return Math.round((new Date(fin) - new Date(inicio)) / 60000)
}

// Para totales positivos (resumen, jornada contratada)
export function formatHoras(minutos) {
  if (minutos <= 0) return '0h'
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h === 0) return `${m}min`
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

// Para diferencias (puede ser negativa = déficit, positiva = extra)
export function formatDiferencia(minutos) {
  if (minutos === 0) return null
  const abs = Math.abs(minutos)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const str = h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`
  return (minutos > 0 ? '+' : '−') + str
}

export function formatHora(iso) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// Convierte getDay() de JS (0=dom) a convención española (0=lun)
export function jsDayToEs(jsDay) {
  return jsDay === 0 ? 6 : jsDay - 1
}

export function calcMinutos(lista, ahora) {
  return lista.reduce((acc, e) => {
    const fin = e.clock_out ?? ahora
    return acc + minutosEntreFechas(e.clock_in, fin)
  }, 0)
}

// Agrupa un array de entradas por semana (clave = fecha del lunes)
export function agruparPorSemana(entradas) {
  return entradas.reduce((acc, e) => {
    const lunes = startOfWeek(new Date(e.date)).toISOString().split('T')[0]
    if (!acc[lunes]) acc[lunes] = []
    acc[lunes].push(e)
    return acc
  }, {})
}
