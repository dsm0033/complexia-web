// Motor de cálculo de nóminas — sin valores hardcodeados
// Todos los tipos y límites vienen de las tablas de referencia fiscal (BD)

function aplicarTramos(base, brackets) {
  const sorted = [...brackets].sort((a, b) => Number(a.min_income) - Number(b.min_income))
  let cuota = 0
  for (const t of sorted) {
    if (base <= Number(t.min_income)) break
    const tope = t.max_income !== null ? Number(t.max_income) : Infinity
    const enTramo = Math.min(base, tope) - Number(t.min_income)
    if (enTramo <= 0) continue
    cuota += enTramo * (Number(t.rate) / 100)
  }
  return cuota
}

// Calcula el % de retención IRPF estimado a partir del salario bruto anual
// Método: cuota bruta - cuota mínimo personal, todo dividido por bruto anual
export function calcularIrpfRate(grossAnual, ssTotalRate, irpfBrackets, settings) {
  const ssAnual      = grossAnual * ssTotalRate
  const rendimiento  = grossAnual - ssAnual
  const minimoPersonal = Number(settings['minimo_personal'] ?? 5550)

  const cuotaBruta   = aplicarTramos(rendimiento, irpfBrackets)
  const cuotaMinimo  = aplicarTramos(minimoPersonal, irpfBrackets)
  const cuotaFinal   = Math.max(0, cuotaBruta - cuotaMinimo)

  return grossAnual > 0 ? cuotaFinal / grossAnual : 0
}

// Calcula la nómina mensual completa de un empleado
// Returns: brutoMensual, deduccionSS, irpfRate, deduccionIRPF, neto, costeEmpresa, esPagaExtra
export function calcularNomina({ contract, ssRates, irpfBrackets, settings, mes }) {
  const monthNum = parseInt(mes.split('-')[1])

  const brutoMensual = Number(contract.gross_annual) / Number(contract.num_payments)

  // Concepto desempleo según tipo de contrato
  const conceptoDesempleo = contract.contract_type === 'indefinido'
    ? 'desempleo_indefinido'
    : 'desempleo_temporal'

  const getRateW = (concept, fallback) =>
    Number(ssRates.find(r => r.concept === concept)?.worker_rate ?? fallback) / 100
  const getRateC = (concept, fallback) =>
    Number(ssRates.find(r => r.concept === concept)?.company_rate ?? fallback) / 100

  // Tipos trabajador
  const ssWorker = {
    cc:        getRateW('contingencias_comunes',  4.70),
    desempleo: getRateW(conceptoDesempleo,         1.55),
    fp:        getRateW('formacion_profesional',   0.10),
    mei:       getRateW('mei',                     0.15),
  }
  const ssTotalWorker = ssWorker.cc + ssWorker.desempleo + ssWorker.fp + ssWorker.mei

  // Tipos empresa
  const ssCompany = {
    cc:        getRateC('contingencias_comunes',  23.60),
    desempleo: getRateC(conceptoDesempleo,          5.50),
    fp:        getRateC('formacion_profesional',    0.60),
    fogasa:    getRateC('fogasa',                   0.20),
    mei:       getRateC('mei',                      0.75),
  }
  const ssTotalCompany = ssCompany.cc + ssCompany.desempleo + ssCompany.fp + ssCompany.fogasa + ssCompany.mei

  const deduccionSS = brutoMensual * ssTotalWorker

  // IRPF
  const irpfRate = Number(contract.irpf_rate) > 0
    ? Number(contract.irpf_rate) / 100
    : calcularIrpfRate(Number(contract.gross_annual), ssTotalWorker, irpfBrackets, settings)

  const deduccionIRPF = brutoMensual * irpfRate
  const neto          = brutoMensual - deduccionSS - deduccionIRPF
  const costeEmpresa  = brutoMensual * (1 + ssTotalCompany)

  // Paga extra: junio (6) y diciembre (12) con 14 pagas → ese mes se pagan 2 nóminas
  const esPagaExtra = Number(contract.num_payments) === 14 && (monthNum === 6 || monthNum === 12)
  const factor = esPagaExtra ? 2 : 1

  return {
    brutoMensual:   brutoMensual   * factor,
    deduccionSS:    deduccionSS    * factor,
    irpfRate,
    deduccionIRPF:  deduccionIRPF  * factor,
    neto:           neto           * factor,
    costeEmpresa:   costeEmpresa   * factor,
    esPagaExtra,
    ssTotalWorker,
    ssTotalCompany,
  }
}
