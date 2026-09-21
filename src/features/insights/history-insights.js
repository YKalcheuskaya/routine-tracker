/**
 * Pure seven-day reporting logic. Past days are calculated only from their saved
 * snapshots, preventing later routine edits from silently changing history.
 */
import { stepSnapshotFor } from '../tracker/tracker-storage'

const categoryNames = ['care', 'move', 'focus']

function dateFromLocalDate(localDate) {
  const [year, month, day] = localDate.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

function toLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function recentLocalDates(localDate, count = 7) {
  const end = dateFromLocalDate(localDate)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end)
    date.setDate(end.getDate() - index)
    return toLocalDate(date)
  })
}

export function summarizeRecord(record) {
  const snapshot = record?.stepSnapshot ?? []
  const completedIds = new Set(record?.completedStepIds ?? [])
  const categories = Object.fromEntries(categoryNames.map((category) => [category, { complete: 0, total: 0 }]))
  for (const step of snapshot) {
    categories[step.category].total += 1
    if (completedIds.has(step.id)) categories[step.category].complete += 1
  }
  const complete = snapshot.filter((step) => completedIds.has(step.id)).length
  return { complete, total: snapshot.length, percentage: snapshot.length ? Math.round((complete / snapshot.length) * 100) : 0, categories }
}

export function buildSevenDayInsights(days, routines, localDate) {
  // Today may not have a saved record yet, so only today's available steps are
  // derived from the live schedule. Earlier unsaved days remain explicitly empty.
  const history = recentLocalDates(localDate).map((date, index) => {
    const stored = days[date]
    const record = stored ?? (index === 0 ? { completedStepIds: [], stepSnapshot: stepSnapshotFor(routines, date) } : null)
    return { date, hasRecord: Boolean(stored) || index === 0, ...summarizeRecord(record) }
  })
  const categories = Object.fromEntries(categoryNames.map((category) => [category, { complete: 0, total: 0 }]))
  for (const day of history) {
    for (const category of categoryNames) {
      categories[category].complete += day.categories[category].complete
      categories[category].total += day.categories[category].total
    }
  }
  return {
    history,
    complete: history.reduce((sum, day) => sum + day.complete, 0),
    total: history.reduce((sum, day) => sum + day.total, 0),
    recordedDays: history.filter((day) => day.hasRecord).length,
    categories,
  }
}

export function formatHistoryDate(localDate, currentDate) {
  if (localDate === currentDate) return 'Today'
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(dateFromLocalDate(localDate))
}
