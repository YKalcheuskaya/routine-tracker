import { describe, expect, it } from 'vitest'
import { bedtimeStatus, dailyProgress, emptyDay, minutesFromTimes, sleepSummary } from './wellness-model'

describe('wellness model', () => {
  it('calculates an overnight sleep duration', () => expect(minutesFromTimes('22:30', '06:15')).toBe(465))

  it('keeps progress limited to each user goal', () => {
    const day = emptyDay()
    day.steps = 12000
    day.waterMl = 1000
    day.meals = [{ id: 'one' }]
    day.sleep.minutes = 480
    const result = dailyProgress(day, { steps: 10000, waterMl: 2000, sleepMinutes: 480, meals: 2 })
    expect(result.score).toBe(75)
    expect(result.complete).toBe(2)
  })

  it('labels a bedtime against a configurable window instead of a clinical claim', () => {
    const day = emptyDay()
    day.sleep.bedtime = '23:00'
    const goals = { bedtime: '22:30', bedtimeWindowMinutes: 45, sleepMinutes: 480 }
    expect(bedtimeStatus(day, goals)).toMatchObject({ withinWindow: true })
    expect(sleepSummary(day, goals).duration.label).toBe('Not logged')
  })
})
