import { describe, it, expect } from 'vitest'
import { classifyGlucose, getGlucoseRange } from '../classification'
import type { MealContext } from '../../../__tests__/fixtures/glucose.fixtures'

type GlucoseRange = 'hypoglycemia' | 'normal' | 'slightly_high' | 'high'

describe('[UNITÁRIO] Classificação Glicêmica — Valores Limítrofes', () => {
  describe('Hipoglicemia (< 70 mg/dL)', () => {
    it('valor 20 → hypoglycemia', () => expect(getGlucoseRange(20)).toBe<GlucoseRange>('hypoglycemia'))
    it('valor 50 → hypoglycemia', () => expect(getGlucoseRange(50)).toBe<GlucoseRange>('hypoglycemia'))
    it('valor 69 → hypoglycemia', () => expect(getGlucoseRange(69)).toBe<GlucoseRange>('hypoglycemia'))
  })

  describe('Normal (70–140 mg/dL)', () => {
    it('valor 70 → normal', () => expect(getGlucoseRange(70)).toBe<GlucoseRange>('normal'))
    it('valor 71 → normal', () => expect(getGlucoseRange(71)).toBe<GlucoseRange>('normal'))
    it('valor 100 → normal', () => expect(getGlucoseRange(100)).toBe<GlucoseRange>('normal'))
    it('valor 139 → normal', () => expect(getGlucoseRange(139)).toBe<GlucoseRange>('normal'))
    it('valor 140 → normal', () => expect(getGlucoseRange(140)).toBe<GlucoseRange>('normal'))
  })

  describe('Levemente Alta (141–180 mg/dL)', () => {
    it('valor 141 → slightly_high', () => expect(getGlucoseRange(141)).toBe<GlucoseRange>('slightly_high'))
    it('valor 160 → slightly_high', () => expect(getGlucoseRange(160)).toBe<GlucoseRange>('slightly_high'))
    it('valor 179 → slightly_high', () => expect(getGlucoseRange(179)).toBe<GlucoseRange>('slightly_high'))
    it('valor 180 → slightly_high', () => expect(getGlucoseRange(180)).toBe<GlucoseRange>('slightly_high'))
  })

  describe('Alta (> 180 mg/dL)', () => {
    it('valor 181 → high', () => expect(getGlucoseRange(181)).toBe<GlucoseRange>('high'))
    it('valor 350 → high', () => expect(getGlucoseRange(350)).toBe<GlucoseRange>('high'))
    it('valor 600 → high', () => expect(getGlucoseRange(600)).toBe<GlucoseRange>('high'))
  })
})

describe('[UNITÁRIO] Classificação por Contexto de Refeição', () => {
  it('glicemia 95 em jejum → normal', () => {
    const result = classifyGlucose({ value: 95, mealContext: 'fasting', insulinStatus: 'not_on_insulin' })
    expect(result.range).toBe('normal')
  })
  it('glicemia 90 pré-refeição → normal', () => {
    const result = classifyGlucose({ value: 90, mealContext: 'pre_meal', insulinStatus: 'not_on_insulin' })
    expect(result.range).toBe('normal')
  })
  it('glicemia 155 pré-refeição → slightly_high', () => {
    const result = classifyGlucose({ value: 155, mealContext: 'pre_meal', insulinStatus: 'not_on_insulin' })
    expect(result.range).toBe('slightly_high')
  })
  it('glicemia 130 pós-refeição → normal', () => {
    const result = classifyGlucose({ value: 130, mealContext: 'post_meal', insulinStatus: 'not_on_insulin' })
    expect(result.range).toBe('normal')
  })
  it('glicemia 200 pós-refeição → high', () => {
    const result = classifyGlucose({ value: 200, mealContext: 'post_meal', insulinStatus: 'not_on_insulin' })
    expect(result.range).toBe('high')
  })
})

describe('[UNITÁRIO] Casos Edge — Inputs Inválidos (100% coverage)', () => {
  it('NaN → TypeError', () => {
    expect(() => classifyGlucose({ value: NaN, mealContext: 'fasting', insulinStatus: 'unknown' })).toThrow(TypeError)
  })
  it('null → TypeError', () => {
    // @ts-expect-error — runtime test
    expect(() => classifyGlucose({ value: null, mealContext: 'fasting', insulinStatus: 'unknown' })).toThrow(TypeError)
  })
  it('undefined → TypeError', () => {
    // @ts-expect-error — runtime test
    expect(() => classifyGlucose({ value: undefined, mealContext: 'fasting', insulinStatus: 'unknown' })).toThrow(TypeError)
  })
  it('string numérica → TypeError', () => {
    // @ts-expect-error — runtime test
    expect(() => classifyGlucose({ value: '100', mealContext: 'fasting', insulinStatus: 'unknown' })).toThrow(TypeError)
  })
  it('número negativo (-1) → RangeError', () => {
    expect(() => classifyGlucose({ value: -1, mealContext: 'fasting', insulinStatus: 'unknown' })).toThrow(RangeError)
  })
  it('zero (0) → RangeError', () => {
    expect(() => classifyGlucose({ value: 0, mealContext: 'fasting', insulinStatus: 'unknown' })).toThrow(RangeError)
  })
  it('valor acima do máximo (601) → RangeError', () => {
    expect(() => classifyGlucose({ value: 601, mealContext: 'fasting', insulinStatus: 'unknown' })).toThrow(RangeError)
  })
  it('Infinity → TypeError', () => {
    expect(() => classifyGlucose({ value: Infinity, mealContext: 'fasting', insulinStatus: 'unknown' })).toThrow(TypeError)
  })
  it('mealContext inválido → TypeError', () => {
    // @ts-expect-error — runtime test
    expect(() => classifyGlucose({ value: 100, mealContext: 'invalid_context', insulinStatus: 'unknown' })).toThrow(TypeError)
  })
})

describe('[UNITÁRIO] Aviso Médico Obrigatório', () => {
  const testCases: Array<[number, MealContext]> = [
    [50, 'fasting'], [70, 'fasting'], [100, 'pre_meal'], [140, 'post_meal'], [160, 'post_meal'], [200, 'post_meal'],
  ]
  it.each(testCases)('glicemia %i em %s contém medicalWarning', (value, mealContext) => {
    const result = classifyGlucose({ value, mealContext, insulinStatus: 'not_on_insulin' })
    expect(result.medicalWarning).toBeTruthy()
    expect(result.medicalWarning).toMatch(/médic|profissional|saúde/i)
  })
})

describe('[UNITÁRIO] Snapshots de Labels', () => {
  it('label de hipoglicemia', () => {
    const result = classifyGlucose({ value: 50, mealContext: 'fasting', insulinStatus: 'unknown' })
    expect(result.label).toMatchSnapshot()
  })
  it('label de normal', () => {
    const result = classifyGlucose({ value: 100, mealContext: 'fasting', insulinStatus: 'unknown' })
    expect(result.label).toMatchSnapshot()
  })
  it('label de levemente alta', () => {
    const result = classifyGlucose({ value: 160, mealContext: 'post_meal', insulinStatus: 'unknown' })
    expect(result.label).toMatchSnapshot()
  })
  it('label de alta', () => {
    const result = classifyGlucose({ value: 250, mealContext: 'post_meal', insulinStatus: 'unknown' })
    expect(result.label).toMatchSnapshot()
  })
})
