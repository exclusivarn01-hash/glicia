export type GlucoseRange = 'hypoglycemia' | 'normal' | 'slightly_high' | 'high'
export type MealContext = 'fasting' | 'pre_meal' | 'post_meal'
export type InsulinStatus = 'on_insulin' | 'not_on_insulin' | 'unknown'

export interface ClassifyInput {
  value: number
  mealContext: MealContext
  insulinStatus: InsulinStatus
}

export interface ClassificationResult {
  range: GlucoseRange
  label: string
  guidance: string
  medicalWarning: string
  alertLevel: 'none' | 'info' | 'warning' | 'critical'
  recommendations: string[]
}

export const GLUCOSE_RANGES = {
  hypoglycemia: { min: 0, max: 69, label: 'Hipoglicemia' },
  normal: { min: 70, max: 140, label: 'Normal' },
  slightly_high: { min: 141, max: 180, label: 'Levemente Elevada' },
  high: { min: 181, max: 600, label: 'Elevada' },
} as const

export const MEDICAL_DISCLAIMER =
  'Este resultado é apenas informativo. Consulte seu médico ou profissional de saúde para orientação personalizada sobre seu tratamento.'

const VALID_MEAL_CONTEXTS: MealContext[] = ['fasting', 'pre_meal', 'post_meal']

export function getGlucoseRange(value: number): GlucoseRange {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new TypeError(`Valor de glicemia inválido: ${value}`)
  }
  if (value < 20 || value > 600) {
    throw new RangeError(`Valor de glicemia fora do intervalo aceito (20–600 mg/dL): ${value}`)
  }
  if (value <= 69) return 'hypoglycemia'
  if (value <= 140) return 'normal'
  if (value <= 180) return 'slightly_high'
  return 'high'
}

const GUIDANCE: Record<GlucoseRange, string> = {
  hypoglycemia:
    'Sua glicemia está abaixo do nível recomendado. Caso sinta sintomas como tontura, suor frio ou tremores, tente consumir uma fonte de carboidrato de rápida absorção (como suco de laranja ou um copo de água com açúcar) e descanse. Se os sintomas persistirem, busque atendimento médico imediatamente.',
  normal:
    'Sua glicemia está dentro da faixa recomendada. Continue mantendo sua rotina saudável de alimentação e atividade física.',
  slightly_high:
    'Sua glicemia está ligeiramente acima do recomendado. Beber água, evitar carboidratos simples nas próximas horas e caminhar um pouco podem ajudar. Monitore sua próxima medição.',
  high:
    'Sua glicemia está acima do nível recomendado. Mantenha-se hidratado e evite alimentos com alto teor de açúcar. Registre este episódio e compartilhe com seu médico na próxima consulta.',
}

const ALERT_LEVELS: Record<GlucoseRange, ClassificationResult['alertLevel']> = {
  hypoglycemia: 'critical',
  normal: 'none',
  slightly_high: 'warning',
  high: 'warning',
}

const LABELS: Record<GlucoseRange, string> = {
  hypoglycemia: 'Hipoglicemia',
  normal: 'Normal',
  slightly_high: 'Levemente Elevada',
  high: 'Elevada',
}

const CONTEXT_LABELS: Record<MealContext, string> = {
  fasting: 'em jejum',
  pre_meal: 'antes da refeição',
  post_meal: 'após a refeição',
}

export function classifyGlucose(input: ClassifyInput): ClassificationResult {
  const { value, mealContext, insulinStatus } = input

  if (typeof value !== 'number' || !isFinite(value)) {
    throw new TypeError(`Valor de glicemia inválido: ${value}`)
  }
  if (value <= 0 || value < 20 || value > 600) {
    throw new RangeError(`Valor de glicemia fora do intervalo aceito (20–600 mg/dL): ${value}`)
  }
  if (!VALID_MEAL_CONTEXTS.includes(mealContext)) {
    throw new TypeError(`Contexto de refeição inválido: ${mealContext}`)
  }

  const range = getGlucoseRange(value)
  const contextLabel = CONTEXT_LABELS[mealContext]

  return {
    range,
    label: LABELS[range],
    guidance: GUIDANCE[range],
    medicalWarning: MEDICAL_DISCLAIMER,
    alertLevel: ALERT_LEVELS[range],
    recommendations: buildRecommendations(range, mealContext),
  }
}

function buildRecommendations(range: GlucoseRange, context: MealContext): string[] {
  const base: Record<GlucoseRange, string[]> = {
    hypoglycemia: [
      'Descanse e monitore seus sintomas',
      'Registre o horário e as condições desta medição',
      'Informe seu médico se episódios forem frequentes',
    ],
    normal: [
      'Continue com sua rotina atual',
      'Registre suas medições regularmente',
      'Mantenha uma alimentação equilibrada',
    ],
    slightly_high: [
      'Hidrate-se bem nas próximas horas',
      'Prefira alimentos com baixo índice glicêmico',
      'Agende uma conversa com seu médico se isso se repetir',
    ],
    high: [
      'Mantenha-se bem hidratado',
      'Evite açúcares e carboidratos refinados por enquanto',
      'Registre este episódio para compartilhar com seu médico',
      'Monitore sua próxima medição com atenção',
    ],
  }
  return base[range]
}
