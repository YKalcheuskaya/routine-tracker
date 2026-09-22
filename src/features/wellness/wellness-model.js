/**
 * Pure calculations for the manual-first wellness journal. The labels describe
 * progress toward user-selected targets; they are not medical assessments.
 */
export const activityTypes = ['Walking', 'Running', 'Strength training', 'Cycling', 'Elliptical', 'Swimming', 'Hiking', 'Yoga', 'Pilates', 'Badminton', 'Other']

export const moodOptions = ['Great', 'Good', 'Okay', 'Low', 'Very low']
export const feelingOptions = ['Rested', 'Okay', 'Tired']

export const defaultGoals = {
  steps: 10000,
  waterMl: 2000,
  sleepMinutes: 480,
  bedtime: '22:30',
  bedtimeWindowMinutes: 45,
  meals: 3,
  activityMinutes: 45,
}

// Medication is an opt-in reminder: this app records a user's own routine only.
export const defaultMedications = []

export function emptyDay() {
  return {
    steps: 0,
    waterMl: 0,
    sleep: { bedtime: '', wakeTime: '', minutes: null, feeling: '' },
    activities: [],
    meals: [],
    medicationLogs: {},
    wellbeing: { mood: '', stress: null, energy: null, note: '' },
    cycle: { day: null, flow: '', menopauseSymptoms: [] },
    symptoms: [],
    routineCompletedIds: [],
  }
}

export function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function goalPercent(actual, target) {
  if (!target || target < 1) return 0
  return clampPercent((actual / target) * 100)
}

export function minutesFromTimes(bedtime, wakeTime) {
  if (!/^\d{2}:\d{2}$/.test(bedtime || '') || !/^\d{2}:\d{2}$/.test(wakeTime || '')) return null
  const [bedHour, bedMinute] = bedtime.split(':').map(Number)
  const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number)
  let total = (wakeHour * 60 + wakeMinute) - (bedHour * 60 + bedMinute)
  if (total <= 0) total += 24 * 60
  return total
}

export function formatMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return '—'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export function activeMinutes(day) {
  return day.activities.reduce((total, activity) => total + (Number(activity.minutes) || 0), 0)
}

export function goalRows(day, goals) {
  const sleepMinutes = day.sleep.minutes ?? minutesFromTimes(day.sleep.bedtime, day.sleep.wakeTime) ?? 0
  return [
    { id: 'activity', label: 'Activity', actual: day.steps, target: goals.steps, value: `${day.steps.toLocaleString()} / ${goals.steps.toLocaleString()} steps`, percent: goalPercent(day.steps, goals.steps), tone: 'activity' },
    { id: 'sleep', label: 'Sleep', actual: sleepMinutes, target: goals.sleepMinutes, value: `${formatMinutes(sleepMinutes)} / ${formatMinutes(goals.sleepMinutes)}`, percent: goalPercent(sleepMinutes, goals.sleepMinutes), tone: 'sleep' },
    { id: 'hydration', label: 'Hydration', actual: day.waterMl, target: goals.waterMl, value: `${(day.waterMl / 1000).toFixed(1)} / ${(goals.waterMl / 1000).toFixed(1)} L`, percent: goalPercent(day.waterMl, goals.waterMl), tone: 'hydration' },
    { id: 'meals', label: 'Meals', actual: day.meals.length, target: goals.meals, value: `${day.meals.length} / ${goals.meals} logged`, percent: goalPercent(day.meals.length, goals.meals), tone: 'meals' },
  ]
}

export function dailyProgress(day, goals) {
  const rows = goalRows(day, goals)
  const complete = rows.filter((row) => row.percent >= 100).length
  const inProgress = rows.filter((row) => row.percent > 0 && row.percent < 100).length
  return { score: Math.round(rows.reduce((sum, row) => sum + row.percent, 0) / rows.length), complete, inProgress, rows }
}

function timeToMinutes(value) {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return null
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

function circularDifference(left, right) {
  const raw = Math.abs(left - right)
  return Math.min(raw, 1440 - raw)
}

export function bedtimeStatus(day, goals) {
  const bedtime = timeToMinutes(day.sleep.bedtime)
  const target = timeToMinutes(goals.bedtime)
  if (bedtime === null || target === null) return { label: 'Not logged', withinWindow: false }
  const withinWindow = circularDifference(bedtime, target) <= goals.bedtimeWindowMinutes
  return { label: withinWindow ? 'Within target' : 'Outside target', withinWindow }
}

export function sleepSummary(day, goals) {
  const minutes = day.sleep.minutes ?? minutesFromTimes(day.sleep.bedtime, day.sleep.wakeTime)
  const duration = minutes === null ? { label: 'Not logged', percent: 0 } : minutes >= goals.sleepMinutes ? { label: 'Met', percent: 100 } : minutes >= goals.sleepMinutes - 60 ? { label: 'Close', percent: goalPercent(minutes, goals.sleepMinutes) } : { label: 'Below target', percent: goalPercent(minutes, goals.sleepMinutes) }
  return { minutes, duration, bedtime: bedtimeStatus(day, goals), feeling: day.sleep.feeling || 'Not logged' }
}
