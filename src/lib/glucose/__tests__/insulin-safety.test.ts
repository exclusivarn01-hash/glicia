import { describe, it, expect } from 'vitest'
import { classifyGlucose } from '../classification'
import {
  ALL_GLUCOSE_RANGES,
  ALL_MEAL_CONTEXTS,
  ALL_INSULIN_STATES,
  type MealContext,
  type InsulinStatus,
} from '../../../__tests__/fixtures/glucose.fixtures'

const FORBIDDEN_INSULIN_WORDS = [
  'dose',
  'unidade de insulina',
  ' ui ',
  'ui de',
  'aplicar insulina',
  'injetar',
  'injete',
  'insulina regular',
  'insulina rápida',
  'insulina lenta',
  'nph',
  'glargina',
  'lispro',
  'aspart',
  'bolus',
  'basal de insulina',
  'bomba de insulina',
  'seringa de insulina',
  'calcule',
  'cálculo de insulina',
  'corrija com insulina',
]

function findInsulinViolations(text: string): string[] {
  const normalizedText = text.toLowerCase()
  return FORBIDDEN_INSULIN_WORDS.filter((word) =>
    normalizedText.includes(word.toLowerCase()),
  )
}

interface ClassificationResult {
  range: string
  label: string
  guidance: string
  medicalWarning: string
  alertLevel?: string
  recommendations?: string[]
}

function checkResultForInsulinWords(result: ClassificationResult, context: string): void {
  const fieldsToCheck: Array<[string, string | undefined]> = [
    ['guidance', result.guidance],
    ['label', result.label],
    ['medicalWarning', result.medicalWarning],
    ['alertLevel', result.alertLevel],
    ...((result.recommendations ?? []).map((rec, i) => [
      `recommendations[${i}]`,
      rec,
    ]) as Array<[string, string]>),
  ]

  for (const [fieldName, fieldValue] of fieldsToCheck) {
    if (!fieldValue) continue
    const violations = findInsulinViolations(fieldValue)
    expect(violations, [
      'VIOLAÇÃO DE SEGURANÇA CRÍTICA!',
      `Contexto: ${context}`,
      `Campo: ${fieldName}`,
      `Texto: "${fieldValue}"`,
      `Palavras proibidas: ${violations.join(', ')}`,
    ].join('\n')).toHaveLength(0)
  }
}

describe('[CONTRATO CRÍTICO] Engine nunca sugere insulina', () => {
  describe('Cobertura: todas as faixas × todos os contextos × todos os estados de insulina', () => {
    for (const glucoseValue of ALL_GLUCOSE_RANGES) {
      for (const mealContext of ALL_MEAL_CONTEXTS) {
        for (const insulinStatus of ALL_INSULIN_STATES) {
          const testLabel = `glicemia=${glucoseValue} | contexto=${mealContext} | insulina=${insulinStatus}`
          it(`não menciona insulina: ${testLabel}`, () => {
            const result = classifyGlucose({ value: glucoseValue, mealContext, insulinStatus })
            checkResultForInsulinWords(result, testLabel)
          })
        }
      }
    }
  })

  describe('Hipoglicemia severa não sugere correção com insulina', () => {
    const hypoglycemiaValues = [20, 30, 40, 50, 55, 60, 65, 69]
    it.each(hypoglycemiaValues)('hipoglicemia %i mg/dL não sugere insulina', (value) => {
      const result = classifyGlucose({ value, mealContext: 'fasting', insulinStatus: 'on_insulin' })
      checkResultForInsulinWords(result, `hipoglicemia severa: ${value}`)
    })
  })

  describe('Hiperglicemia não sugere dose corretiva de insulina', () => {
    const hyperglycemiaValues = [181, 200, 250, 300, 350, 400, 500, 600]
    it.each(hyperglycemiaValues)('hiperglicemia %i mg/dL não sugere dose', (value) => {
      const result = classifyGlucose({ value, mealContext: 'post_meal', insulinStatus: 'on_insulin' })
      checkResultForInsulinWords(result, `hiperglicemia: ${value}`)
    })
  })

  describe('Aviso médico obrigatório em todas as respostas', () => {
    it.each(ALL_GLUCOSE_RANGES)('glicemia %i mg/dL contém aviso médico', (value) => {
      const result = classifyGlucose({ value, mealContext: 'fasting', insulinStatus: 'unknown' })
      expect(result.medicalWarning, `Glicemia ${value}: medicalWarning deve estar presente`).toBeTruthy()
      expect(result.medicalWarning.length).toBeGreaterThan(10)
    })
  })

  describe('Campos obrigatórios sempre presentes', () => {
    it('resultado de classificação contém todos os campos obrigatórios', () => {
      const result = classifyGlucose({ value: 100, mealContext: 'fasting', insulinStatus: 'not_on_insulin' })
      expect(result).toHaveProperty('range')
      expect(result).toHaveProperty('label')
      expect(result).toHaveProperty('guidance')
      expect(result).toHaveProperty('medicalWarning')
    })
  })
})
