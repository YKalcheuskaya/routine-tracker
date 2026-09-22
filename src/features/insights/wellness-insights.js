import { dailyProgress, emptyDay, formatMinutes, sleepSummary } from '../wellness/wellness-model'

function dateAtNoon(value) { return new Date(`${value}T12:00:00`) }
function localDate(value) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` }

export function recentDates(endDate, count = 7) {
  const end = dateAtNoon(endDate)
  return Array.from({ length: count }, (_, index) => { const date = new Date(end); date.setDate(end.getDate() - (count - index - 1)); return localDate(date) })
}

export function formatShortDate(date) { return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateAtNoon(date)) }

export function buildWeeklyInsights(days, goals, endDate) {
  const history = recentDates(endDate).map((date) => {
    const day = days[date] ?? emptyDay()
    const hasRecord = Boolean(days[date])
    const progress = dailyProgress(day, goals)
    const sleep = sleepSummary(day, goals)
    return { date, hasRecord, score: progress.score, waterMl: day.waterMl, steps: day.steps, mood: day.wellbeing.mood, stress: day.wellbeing.stress, sleepMinutes: sleep.minutes, sleepPlanMet: sleep.duration.label === 'Met' && sleep.bedtime.withinWindow }
  })
  const recorded = history.filter((item) => item.hasRecord)
  const average = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null
  const sleepValues = recorded.map((item) => item.sleepMinutes).filter(Number.isFinite)
  const stressValues = recorded.map((item) => item.stress).filter(Number.isFinite)
  return {
    history,
    goalsCompleted: recorded.filter((item) => item.score >= 100).length,
    averageProgress: average(recorded.map((item) => item.score)),
    averageWater: average(recorded.map((item) => item.waterMl)),
    averageSteps: average(recorded.map((item) => item.steps)),
    averageSleep: average(sleepValues),
    averageStress: average(stressValues),
    sleepPlanNights: recorded.filter((item) => item.sleepPlanMet).length,
    sleepRange: sleepValues.length ? { min: Math.min(...sleepValues), max: Math.max(...sleepValues) } : null,
    sleepRangeLabel: sleepValues.length ? `${formatMinutes(Math.min(...sleepValues))} – ${formatMinutes(Math.max(...sleepValues))}` : 'No recorded sleep yet',
  }
}
