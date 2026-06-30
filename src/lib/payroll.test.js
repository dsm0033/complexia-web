import { describe, it, expect } from 'vitest'
import { calcularIrpfRate, calcularNomina } from './payroll.js'

// Tramos IRPF 2026 (España)
const irpfBrackets = [
  { min_income: 0,       max_income: 12450,   rate: 19 },
  { min_income: 12450,   max_income: 20200,   rate: 24 },
  { min_income: 20200,   max_income: 35200,   rate: 30 },
  { min_income: 35200,   max_income: 60000,   rate: 37 },
  { min_income: 60000,   max_income: 300000,  rate: 45 },
  { min_income: 300000,  max_income: null,     rate: 47 },
]

const ssRates = [
  { concept: 'contingencias_comunes',  worker_rate: 4.70,  company_rate: 23.60 },
  { concept: 'desempleo_indefinido',   worker_rate: 1.55,  company_rate: 5.50  },
  { concept: 'desempleo_temporal',     worker_rate: 1.55,  company_rate: 6.70  },
  { concept: 'formacion_profesional',  worker_rate: 0.10,  company_rate: 0.60  },
  { concept: 'fogasa',                 worker_rate: 0,     company_rate: 0.20  },
  { concept: 'mei',                    worker_rate: 0.15,  company_rate: 0.75  },
]

const settings = { minimo_personal: '5550' }

// 4.70 + 1.55 + 0.10 + 0.15 = 6.50 %
const SS_WORKER_TOTAL = 0.065
// 23.60 + 5.50 + 0.60 + 0.20 + 0.75 = 30.65 %
const SS_COMPANY_TOTAL = 0.3065

describe('calcularIrpfRate', () => {
  it('salario cero → retención 0', () => {
    expect(calcularIrpfRate(0, SS_WORKER_TOTAL, irpfBrackets, settings)).toBe(0)
  })

  it('salario muy bajo (rendimiento < mínimo personal) → retención 0', () => {
    const rate = calcularIrpfRate(5000, SS_WORKER_TOTAL, irpfBrackets, settings)
    // rendimiento = 5000 - 325 = 4675 < mínimo personal 5550 → cuota neta = 0
    expect(rate).toBe(0)
  })

  it('salario medio → retención positiva y menor que el tipo marginal', () => {
    const rate = calcularIrpfRate(24000, SS_WORKER_TOTAL, irpfBrackets, settings)
    expect(rate).toBeGreaterThan(0)
    expect(rate).toBeLessThan(0.30) // tipo marginal de su tramo
  })

  it('a mayor salario, mayor retención', () => {
    const rateBajo = calcularIrpfRate(18000, SS_WORKER_TOTAL, irpfBrackets, settings)
    const rateAlto = calcularIrpfRate(60000, SS_WORKER_TOTAL, irpfBrackets, settings)
    expect(rateAlto).toBeGreaterThan(rateBajo)
  })
})

describe('calcularNomina', () => {
  const baseContract = {
    gross_annual: 24000,
    num_payments: 12,
    contract_type: 'indefinido',
    irpf_rate: 0,
  }

  it('bruto mensual = gross_annual / num_payments', () => {
    const { brutoMensual } = calcularNomina({ contract: baseContract, ssRates, irpfBrackets, settings, mes: '2026-03' })
    expect(brutoMensual).toBeCloseTo(24000 / 12, 2)
  })

  it('neto < bruto siempre', () => {
    const { brutoMensual, neto } = calcularNomina({ contract: baseContract, ssRates, irpfBrackets, settings, mes: '2026-03' })
    expect(neto).toBeLessThan(brutoMensual)
  })

  it('deduccionSS = bruto × ssTotalWorker', () => {
    const { brutoMensual, deduccionSS, ssTotalWorker } = calcularNomina({ contract: baseContract, ssRates, irpfBrackets, settings, mes: '2026-03' })
    expect(deduccionSS).toBeCloseTo(brutoMensual * ssTotalWorker, 2)
    expect(ssTotalWorker).toBeCloseTo(SS_WORKER_TOTAL, 4)
  })

  it('costeEmpresa = bruto × (1 + ssTotalCompany)', () => {
    const { brutoMensual, costeEmpresa, ssTotalCompany } = calcularNomina({ contract: baseContract, ssRates, irpfBrackets, settings, mes: '2026-03' })
    expect(ssTotalCompany).toBeCloseTo(SS_COMPANY_TOTAL, 4)
    expect(costeEmpresa).toBeCloseTo(brutoMensual * (1 + SS_COMPANY_TOTAL), 2)
  })

  it('usa irpf_rate del contrato si está fijado', () => {
    const contract = { ...baseContract, irpf_rate: 15 }
    const { irpfRate, deduccionIRPF, brutoMensual } = calcularNomina({ contract, ssRates, irpfBrackets, settings, mes: '2026-03' })
    expect(irpfRate).toBe(0.15)
    expect(deduccionIRPF).toBeCloseTo(brutoMensual * 0.15, 2)
  })

  describe('paga extra (14 pagas)', () => {
    const contrato14 = { ...baseContract, num_payments: 14, irpf_rate: 0 }

    it('en junio dobla el importe', () => {
      const normal = calcularNomina({ contract: contrato14, ssRates, irpfBrackets, settings, mes: '2026-03' })
      const extra  = calcularNomina({ contract: contrato14, ssRates, irpfBrackets, settings, mes: '2026-06' })
      expect(extra.esPagaExtra).toBe(true)
      expect(extra.brutoMensual).toBeCloseTo(normal.brutoMensual * 2, 2)
      expect(extra.neto).toBeCloseTo(normal.neto * 2, 2)
    })

    it('en diciembre dobla el importe', () => {
      const normal = calcularNomina({ contract: contrato14, ssRates, irpfBrackets, settings, mes: '2026-03' })
      const extra  = calcularNomina({ contract: contrato14, ssRates, irpfBrackets, settings, mes: '2026-12' })
      expect(extra.esPagaExtra).toBe(true)
      expect(extra.brutoMensual).toBeCloseTo(normal.brutoMensual * 2, 2)
    })

    it('en otros meses no hay paga extra', () => {
      const { esPagaExtra } = calcularNomina({ contract: contrato14, ssRates, irpfBrackets, settings, mes: '2026-07' })
      expect(esPagaExtra).toBe(false)
    })

    it('con 12 pagas nunca hay paga extra aunque sea junio', () => {
      const { esPagaExtra } = calcularNomina({ contract: baseContract, ssRates, irpfBrackets, settings, mes: '2026-06' })
      expect(esPagaExtra).toBe(false)
    })
  })

  describe('tipo de contrato', () => {
    it('contrato temporal usa tipos desempleo_temporal en empresa', () => {
      const contractTemporal = { ...baseContract, contract_type: 'temporal', irpf_rate: 15 }
      const { ssTotalCompany } = calcularNomina({ contract: contractTemporal, ssRates, irpfBrackets, settings, mes: '2026-03' })
      // desempleo empresa temporal = 6.70 vs indefinido = 5.50 → coste empresa mayor
      const { ssTotalCompany: companyIndef } = calcularNomina({ contract: { ...baseContract, irpf_rate: 15 }, ssRates, irpfBrackets, settings, mes: '2026-03' })
      expect(ssTotalCompany).toBeGreaterThan(companyIndef)
    })
  })
})
