import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { classifyGlucose } from '../../../lib/glucose/classification'

const MealContextSchema = z.enum(['fasting', 'pre_meal', 'post_meal'])
const InsulinStatusSchema = z.enum(['on_insulin', 'not_on_insulin', 'unknown'])

const CreateReadingInput = z.object({
  value: z.number().min(20, 'Valor mínimo: 20 mg/dL').max(600, 'Valor máximo: 600 mg/dL'),
  mealContext: MealContextSchema,
  insulinStatus: InsulinStatusSchema,
  notes: z.string().max(500).optional(),
  recordedAt: z.string().datetime().optional(),
})

export const glucoseRouter = createTRPCRouter({
  createReading: protectedProcedure
    .input(CreateReadingInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const classification = classifyGlucose({
        value: input.value,
        mealContext: input.mealContext,
        insulinStatus: input.insulinStatus,
      })

      const { data, error } = await ctx.supabase
        .from('glucose_readings')
        .insert({
          userId,
          value: input.value,
          unit: 'mg/dL',
          mealContext: input.mealContext,
          insulinStatus: input.insulinStatus,
          notes: input.notes,
          glucoseRange: classification.range,
          recordedAt: input.recordedAt ?? new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { ...data, classification }
    }),

  getReadings: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      let query = ctx.supabase
        .from('glucose_readings')
        .select('*')
        .eq('userId', userId)
        .is('deletedAt', null)
        .order('recordedAt', { ascending: false })
        .limit(input.limit + 1)

      if (input.dateFrom) query = query.gte('recordedAt', input.dateFrom)
      if (input.dateTo) query = query.lte('recordedAt', input.dateTo)
      if (input.cursor) query = query.lt('recordedAt', input.cursor)

      const { data, error } = await query
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      const hasMore = data.length > input.limit
      const readings = hasMore ? data.slice(0, input.limit) : data
      const nextCursor = hasMore ? readings[readings.length - 1].recordedAt : undefined

      return { readings, nextCursor }
    }),

  getDailySummary: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const dayStart = `${input.date}T00:00:00.000Z`
      const dayEnd = `${input.date}T23:59:59.999Z`

      const { data, error } = await ctx.supabase
        .from('glucose_readings')
        .select('value, glucoseRange, mealContext, recordedAt')
        .eq('userId', userId)
        .gte('recordedAt', dayStart)
        .lte('recordedAt', dayEnd)
        .is('deletedAt', null)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      if (!data.length) {
        return { average: null, min: null, max: null, totalReadings: 0, hypoglycemiaCount: 0, timeInRange: null }
      }

      const values = data.map((r) => r.value)
      const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const inRange = values.filter((v) => v >= 70 && v <= 180).length
      const timeInRange = Math.round((inRange / values.length) * 100)
      const hypoglycemiaCount = data.filter((r) => r.glucoseRange === 'hypoglycemia').length

      return { average, min, max, totalReadings: data.length, hypoglycemiaCount, timeInRange }
    }),

  getWeeklyTrend: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await ctx.supabase
        .from('glucose_readings')
        .select('value, glucoseRange, recordedAt')
        .eq('userId', userId)
        .gte('recordedAt', sevenDaysAgo)
        .is('deletedAt', null)
        .order('recordedAt', { ascending: true })

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),

  deleteReading: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { error } = await ctx.supabase
        .from('glucose_readings')
        .update({ deletedAt: new Date().toISOString() })
        .eq('id', input.id)
        .eq('userId', userId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { success: true }
    }),
})
