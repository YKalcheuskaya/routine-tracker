import { expect, it } from 'vitest'
import { buildWeeklyInsights } from './wellness-insights'
import { emptyDay } from '../wellness/wellness-model'

it('keeps missing days explicit in weekly insights', () => {
  const day = emptyDay()
  day.steps = 10000
  day.waterMl = 2000
  day.meals = [{ id: 'one' }, { id: 'two' }, { id: 'three' }]
  day.sleep = { bedtime: '22:30', wakeTime: '06:30', minutes: 480, feeling: 'Rested' }
  const result = buildWeeklyInsights({ '2026-09-21': day }, { steps: 10000, waterMl: 2000, sleepMinutes: 480, bedtime: '22:30', bedtimeWindowMinutes: 45, meals: 3 }, '2026-09-21')
  expect(result.history).toHaveLength(7)
  expect(result.history.filter((item) => item.hasRecord)).toHaveLength(1)
  expect(result.goalsCompleted).toBe(1)
})
