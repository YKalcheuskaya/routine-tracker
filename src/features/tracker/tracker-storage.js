/**
 * Versioned persistence boundary for Routine Tracker. This module owns the storage
 * contract, validation, V1-to-V2 migration, safe normalization, and immutable
 * completion updates; UI components never parse localStorage themselves.
 */
export const TRACKER_STORAGE_KEY = 'routine-tracker:daily-progress'
export const TRACKER_STORAGE_VERSION = 2

const categories = new Set(['care', 'move', 'focus'])
const periods = new Set(['am', 'pm'])
const weekdays = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])

function cloneRoutines(routines) {
  return routines.map((routine) => ({
    ...routine,
    weekdays: [...routine.weekdays],
    steps: routine.steps.map((step) => ({ ...step })),
  }))
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidRoutine(routine) {
  return routine
    && isNonEmptyString(routine.id)
    && categories.has(routine.category)
    && periods.has(routine.period)
    && isNonEmptyString(routine.title)
    && typeof routine.description === 'string'
    && Array.isArray(routine.weekdays)
    && routine.weekdays.length > 0
    && routine.weekdays.every((day) => weekdays.has(day))
    && new Set(routine.weekdays).size === routine.weekdays.length
    && Array.isArray(routine.steps)
    && routine.steps.length > 0
    && routine.steps.every((step) => step && isNonEmptyString(step.id) && isNonEmptyString(step.title) && (step.detail === undefined || typeof step.detail === 'string'))
    && new Set(routine.steps.map((step) => step.id)).size === routine.steps.length
}

function isValidDayRecord(record) {
  return record
    && Array.isArray(record.completedStepIds)
    && record.completedStepIds.every(isNonEmptyString)
    && Array.isArray(record.stepSnapshot)
    && record.stepSnapshot.every((step) => step && isNonEmptyString(step.id) && categories.has(step.category))
}

function isValidData(value) {
  return value
    && value.version === TRACKER_STORAGE_VERSION
    && Array.isArray(value.routines)
    && value.routines.every(isValidRoutine)
    && new Set(value.routines.map((routine) => routine.id)).size === value.routines.length
    && value.days
    && typeof value.days === 'object'
    && !Array.isArray(value.days)
    && Object.entries(value.days).every(([date, record]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && isValidDayRecord(record))
}

function weekdayForDate(localDate) {
  const [year, month, day] = localDate.split('-').map(Number)
  const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return names[new Date(year, month - 1, day, 12).getDay()]
}

export function stepSnapshotFor(routines, localDate) {
  // A compact snapshot records only the facts required by historical reporting.
  // It deliberately does not copy editable titles, descriptions, or step details.
  const weekday = weekdayForDate(localDate)
  return routines
    .filter((routine) => routine.weekdays.includes(weekday))
    .flatMap((routine) => routine.steps.map((step) => ({ id: `${routine.id}:${step.id}`, category: routine.category })))
}

export function createTrackerData(defaultRoutines) {
  return { version: TRACKER_STORAGE_VERSION, routines: cloneRoutines(defaultRoutines), days: {} }
}

function migrateVersionOne(value, defaultRoutines) {
  // V1 stored only one day's completed IDs. Migration rebuilds that day's
  // available-step snapshot from the known demo routines and drops stale IDs.
  const valid = value
    && value.version === 1
    && /^\d{4}-\d{2}-\d{2}$/.test(value.localDate)
    && Array.isArray(value.completedStepIds)
    && value.completedStepIds.every(isNonEmptyString)
  if (!valid) return null
  const data = createTrackerData(defaultRoutines)
  const snapshot = stepSnapshotFor(data.routines, value.localDate)
  const availableIds = new Set(snapshot.map((step) => step.id))
  data.days[value.localDate] = {
    completedStepIds: [...new Set(value.completedStepIds)].filter((id) => availableIds.has(id)),
    stepSnapshot: snapshot,
  }
  return data
}

function normalizeData(value) {
  return {
    version: TRACKER_STORAGE_VERSION,
    routines: cloneRoutines(value.routines),
    days: Object.fromEntries(Object.entries(value.days).map(([date, record]) => [date, {
      completedStepIds: [...new Set(record.completedStepIds)],
      stepSnapshot: record.stepSnapshot.map((step) => ({ ...step })),
    }])),
  }
}

export function loadTrackerData(storage, defaultRoutines) {
  // Invalid or unreadable data never crashes the app. The returned flags let the
  // UI distinguish recovery from a browser that cannot persist data at all.
  try {
    const raw = storage.getItem(TRACKER_STORAGE_KEY)
    if (!raw) return { data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: true }
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { data: createTrackerData(defaultRoutines), recovered: true, migrated: false, available: true }
    }
    const migrated = migrateVersionOne(parsed, defaultRoutines)
    if (migrated) return { data: migrated, recovered: false, migrated: true, available: true }
    if (!isValidData(parsed)) return { data: createTrackerData(defaultRoutines), recovered: true, migrated: false, available: true }
    return { data: normalizeData(parsed), recovered: false, migrated: false, available: true }
  } catch {
    return { data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: false }
  }
}

export function saveTrackerData(storage, data) {
  try {
    storage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function serializeTrackerData(data) {
  return JSON.stringify(normalizeData(data), null, 2)
}

export function parseTrackerImport(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { data: null, error: 'The selected file is not valid JSON.' }
  }
  if (!isValidData(parsed)) return { data: null, error: 'The selected file is not a valid Routine Tracker version 2 export.' }
  return { data: normalizeData(parsed), error: null }
}

export function toggleStepForDate(data, localDate, stepId) {
  const snapshot = stepSnapshotFor(data.routines, localDate)
  const availableIds = new Set(snapshot.map((step) => step.id))
  if (!availableIds.has(stepId)) return data
  const current = data.days[localDate]?.completedStepIds ?? []
  const completed = new Set(current.filter((id) => availableIds.has(id)))
  completed.has(stepId) ? completed.delete(stepId) : completed.add(stepId)
  return {
    ...data,
    days: {
      ...data.days,
      [localDate]: { completedStepIds: [...completed], stepSnapshot: snapshot },
    },
  }
}
