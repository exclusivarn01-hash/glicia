export type GlucoseRange = 'hypoglycemia' | 'normal' | 'slightly_high' | 'high'
export type MealContext = 'fasting' | 'pre_meal' | 'post_meal'
export type InsulinStatus = 'on_insulin' | 'not_on_insulin' | 'unknown'

export interface GlucoseReading {
  id: string
  userId: string
  value: number
  unit: 'mg/dL'
  mealContext: MealContext
  insulinStatus: InsulinStatus
  notes?: string
  recordedAt: Date
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface UserFixture {
  id: string
  email: string
  name: string
  timezone: string
  createdAt: Date
}

export const USER_A: UserFixture = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'user-a@glicia-test.com',
  name: 'Usuário A',
  timezone: 'America/Sao_Paulo',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

export const USER_B: UserFixture = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'user-b@glicia-test.com',
  name: 'Usuário B',
  timezone: 'America/Sao_Paulo',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

export const HYPOGLYCEMIA_READINGS: GlucoseReading[] = [
  { id: 'hypo-001', userId: USER_A.id, value: 20, unit: 'mg/dL', mealContext: 'fasting', insulinStatus: 'on_insulin', recordedAt: new Date('2024-06-15T07:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T07:00:00Z'), updatedAt: new Date('2024-06-15T07:00:00Z') },
  { id: 'hypo-002', userId: USER_A.id, value: 50, unit: 'mg/dL', mealContext: 'pre_meal', insulinStatus: 'on_insulin', recordedAt: new Date('2024-06-15T12:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T12:00:00Z'), updatedAt: new Date('2024-06-15T12:00:00Z') },
  { id: 'hypo-003', userId: USER_A.id, value: 69, unit: 'mg/dL', mealContext: 'pre_meal', insulinStatus: 'not_on_insulin', recordedAt: new Date('2024-06-15T18:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T18:00:00Z'), updatedAt: new Date('2024-06-15T18:00:00Z') },
]

export const NORMAL_READINGS: GlucoseReading[] = [
  { id: 'normal-001', userId: USER_A.id, value: 70, unit: 'mg/dL', mealContext: 'fasting', insulinStatus: 'not_on_insulin', recordedAt: new Date('2024-06-15T07:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T07:00:00Z'), updatedAt: new Date('2024-06-15T07:00:00Z') },
  { id: 'normal-002', userId: USER_A.id, value: 100, unit: 'mg/dL', mealContext: 'fasting', insulinStatus: 'not_on_insulin', recordedAt: new Date('2024-06-15T07:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T07:00:00Z'), updatedAt: new Date('2024-06-15T07:00:00Z') },
  { id: 'normal-003', userId: USER_A.id, value: 140, unit: 'mg/dL', mealContext: 'post_meal', insulinStatus: 'not_on_insulin', recordedAt: new Date('2024-06-15T14:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T14:00:00Z'), updatedAt: new Date('2024-06-15T14:00:00Z') },
]

export const SLIGHTLY_HIGH_READINGS: GlucoseReading[] = [
  { id: 'slight-001', userId: USER_A.id, value: 141, unit: 'mg/dL', mealContext: 'post_meal', insulinStatus: 'not_on_insulin', recordedAt: new Date('2024-06-15T14:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T14:00:00Z'), updatedAt: new Date('2024-06-15T14:00:00Z') },
  { id: 'slight-002', userId: USER_A.id, value: 160, unit: 'mg/dL', mealContext: 'post_meal', insulinStatus: 'not_on_insulin', recordedAt: new Date('2024-06-15T14:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T14:00:00Z'), updatedAt: new Date('2024-06-15T14:00:00Z') },
  { id: 'slight-003', userId: USER_A.id, value: 180, unit: 'mg/dL', mealContext: 'post_meal', insulinStatus: 'not_on_insulin', recordedAt: new Date('2024-06-15T14:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T14:00:00Z'), updatedAt: new Date('2024-06-15T14:00:00Z') },
]

export const HIGH_READINGS: GlucoseReading[] = [
  { id: 'high-001', userId: USER_A.id, value: 181, unit: 'mg/dL', mealContext: 'post_meal', insulinStatus: 'on_insulin', recordedAt: new Date('2024-06-15T14:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T14:00:00Z'), updatedAt: new Date('2024-06-15T14:00:00Z') },
  { id: 'high-002', userId: USER_A.id, value: 350, unit: 'mg/dL', mealContext: 'post_meal', insulinStatus: 'on_insulin', recordedAt: new Date('2024-06-15T14:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T14:00:00Z'), updatedAt: new Date('2024-06-15T14:00:00Z') },
  { id: 'high-003', userId: USER_A.id, value: 600, unit: 'mg/dL', mealContext: 'post_meal', insulinStatus: 'on_insulin', recordedAt: new Date('2024-06-15T14:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T14:00:00Z'), updatedAt: new Date('2024-06-15T14:00:00Z') },
]

export const TWO_HYPOGLYCEMIAS_SAME_DAY: GlucoseReading[] = [
  { id: 'critical-hypo-001', userId: USER_A.id, value: 58, unit: 'mg/dL', mealContext: 'fasting', insulinStatus: 'on_insulin', notes: 'Primeiro episódio', recordedAt: new Date('2024-06-20T07:30:00Z'), deletedAt: null, createdAt: new Date('2024-06-20T07:30:00Z'), updatedAt: new Date('2024-06-20T07:30:00Z') },
  { id: 'critical-hypo-002', userId: USER_A.id, value: 62, unit: 'mg/dL', mealContext: 'pre_meal', insulinStatus: 'on_insulin', notes: 'Segundo episódio — ALERTA CRÍTICO', recordedAt: new Date('2024-06-20T13:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-20T13:00:00Z'), updatedAt: new Date('2024-06-20T13:00:00Z') },
]

export const THREE_HYPOGLYCEMIAS_SAME_DAY: GlucoseReading[] = [
  ...TWO_HYPOGLYCEMIAS_SAME_DAY,
  { id: 'critical-hypo-003', userId: USER_A.id, value: 55, unit: 'mg/dL', mealContext: 'post_meal', insulinStatus: 'on_insulin', notes: 'Terceiro episódio — alerta persistente', recordedAt: new Date('2024-06-20T19:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-20T19:00:00Z'), updatedAt: new Date('2024-06-20T19:00:00Z') },
]

export const HYPO_DIFFERENT_DAYS: GlucoseReading[] = [
  { id: 'diff-day-hypo-001', userId: USER_A.id, value: 65, unit: 'mg/dL', mealContext: 'fasting', insulinStatus: 'on_insulin', recordedAt: new Date('2024-06-20T07:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-20T07:00:00Z'), updatedAt: new Date('2024-06-20T07:00:00Z') },
  { id: 'diff-day-hypo-002', userId: USER_A.id, value: 68, unit: 'mg/dL', mealContext: 'fasting', insulinStatus: 'on_insulin', recordedAt: new Date('2024-06-21T07:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-21T07:00:00Z'), updatedAt: new Date('2024-06-21T07:00:00Z') },
]

export const SOFT_DELETED_HYPO: GlucoseReading = {
  id: 'soft-deleted-hypo-001', userId: USER_A.id, value: 60, unit: 'mg/dL', mealContext: 'pre_meal', insulinStatus: 'on_insulin',
  recordedAt: new Date('2024-06-20T10:00:00Z'), deletedAt: new Date('2024-06-20T11:00:00Z'),
  createdAt: new Date('2024-06-20T10:00:00Z'), updatedAt: new Date('2024-06-20T11:00:00Z'),
}

export const USER_B_READINGS: GlucoseReading[] = [
  { id: 'user-b-reading-001', userId: USER_B.id, value: 120, unit: 'mg/dL', mealContext: 'fasting', insulinStatus: 'not_on_insulin', recordedAt: new Date('2024-06-15T07:00:00Z'), deletedAt: null, createdAt: new Date('2024-06-15T07:00:00Z'), updatedAt: new Date('2024-06-15T07:00:00Z') },
]

function generateDailyReadings(userId: string, days: number, baseDate = new Date('2024-06-15')): GlucoseReading[] {
  const readings: GlucoseReading[] = []
  const contexts: MealContext[] = ['fasting', 'pre_meal', 'post_meal']
  const values = [95, 110, 145, 88, 130, 160, 102]
  for (let d = 0; d < days; d++) {
    for (let r = 0; r < 3; r++) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - d)
      date.setHours(7 + r * 5, 0, 0, 0)
      readings.push({
        id: `dataset-${days}d-${d}-${r}`,
        userId, value: values[(d * 3 + r) % values.length],
        unit: 'mg/dL', mealContext: contexts[r], insulinStatus: 'not_on_insulin',
        recordedAt: date, deletedAt: null, createdAt: date, updatedAt: date,
      })
    }
  }
  return readings
}

export const DATASET_7_DAYS = generateDailyReadings(USER_A.id, 7)
export const DATASET_30_DAYS = generateDailyReadings(USER_A.id, 30)
export const DATASET_90_DAYS = generateDailyReadings(USER_A.id, 90)

export const ALL_MEAL_CONTEXTS: MealContext[] = ['fasting', 'pre_meal', 'post_meal']
export const ALL_INSULIN_STATES: InsulinStatus[] = ['on_insulin', 'not_on_insulin', 'unknown']
export const ALL_GLUCOSE_RANGES = [20, 50, 69, 70, 100, 140, 141, 160, 180, 181, 350, 600]
