/**
 * Versioned local persistence for the wellness tracker. Health entries remain
 * in this browser; this layer validates, migrates, and immutably updates them.
 */
import { defaultGoals, defaultMedications, emptyDay } from '../wellness/wellness-model'

export const TRACKER_STORAGE_KEY = 'routine-tracker:daily-progress'
export const TRACKER_STORAGE_VERSION = 3

function cloneRoutines(routines = []) {
  return routines.map((routine) => ({ ...routine, weekdays: [...routine.weekdays], steps: routine.steps.map((step) => ({ ...step })) }))
}

function cloneDay(day) {
  const base = emptyDay()
  return {
    ...base,
    ...day,
    sleep: { ...base.sleep, ...day?.sleep },
    activities: (day?.activities ?? []).map((activity) => ({ ...activity })),
    meals: (day?.meals ?? []).map((meal) => ({ ...meal })),
    medicationLogs: { ...(day?.medicationLogs ?? {}) },
    wellbeing: { ...base.wellbeing, ...day?.wellbeing },
    cycle: { ...base.cycle, ...day?.cycle, menopauseSymptoms: [...(day?.cycle?.menopauseSymptoms ?? [])] },
    symptoms: (day?.symptoms ?? []).map((symptom) => ({ ...symptom })),
    routineCompletedIds: [...(day?.routineCompletedIds ?? [])],
  }
}

function validDate(date) { return /^\d{4}-\d{2}-\d{2}$/.test(date) }
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0 }
function nonNegative(value) { return Number.isFinite(value) && value >= 0 }

function isValidDay(day) {
  return day && typeof day === 'object'
    && nonNegative(day.steps) && nonNegative(day.waterMl)
    && day.sleep && typeof day.sleep === 'object'
    && Array.isArray(day.activities) && day.activities.every((item) => nonEmpty(item.id) && nonEmpty(item.type) && nonNegative(item.minutes))
    && Array.isArray(day.meals) && day.meals.every((item) => nonEmpty(item.id) && nonEmpty(item.type))
    && day.medicationLogs && typeof day.medicationLogs === 'object'
    && day.wellbeing && typeof day.wellbeing === 'object'
    && day.cycle && typeof day.cycle === 'object'
    && Array.isArray(day.symptoms)
    && Array.isArray(day.routineCompletedIds)
}

function isValidData(value) {
  return value && value.version === TRACKER_STORAGE_VERSION
    && value.goals && typeof value.goals === 'object'
    && Object.entries(defaultGoals).every(([key]) => Number.isFinite(value.goals[key]) || (key === 'bedtime' && typeof value.goals[key] === 'string'))
    && Array.isArray(value.medications) && value.medications.every((item) => nonEmpty(item.id) && nonEmpty(item.label) && /^\d{2}:\d{2}$/.test(item.time) && Array.isArray(item.weekdays))
    && Array.isArray(value.routines)
    && value.days && typeof value.days === 'object' && !Array.isArray(value.days)
    && Object.entries(value.days).every(([date, day]) => validDate(date) && isValidDay(day))
}

export function createTrackerData(defaultRoutines = []) {
  return {
    version: TRACKER_STORAGE_VERSION,
    goals: { ...defaultGoals },
    medications: defaultMedications.map((item) => ({ ...item, weekdays: [...item.weekdays] })),
    routines: cloneRoutines(defaultRoutines),
    days: {},
  }
}

function migrateLegacy(value, defaultRoutines) {
  if (!value || ![1, 2].includes(value.version)) return null
  const data = createTrackerData(defaultRoutines)
  if (value.version === 1 && validDate(value.localDate)) {
    data.days[value.localDate] = { ...emptyDay(), routineCompletedIds: [...new Set(value.completedStepIds ?? [])] }
  }
  if (value.version === 2 && value.days && typeof value.days === 'object') {
    data.routines = cloneRoutines(value.routines ?? defaultRoutines)
    for (const [date, record] of Object.entries(value.days)) {
      if (!validDate(date)) continue
      data.days[date] = { ...emptyDay(), routineCompletedIds: [...new Set(record?.completedStepIds ?? [])] }
    }
  }
  return data
}

export function normalizeData(value) {
  return {
    version: TRACKER_STORAGE_VERSION,
    goals: { ...defaultGoals, ...value.goals },
    medications: value.medications.map((item) => ({ ...item, weekdays: [...item.weekdays] })),
    routines: cloneRoutines(value.routines),
    days: Object.fromEntries(Object.entries(value.days).map(([date, day]) => [date, cloneDay(day)])),
  }
}

export function loadTrackerData(storage, defaultRoutines) {
  try {
    const raw = storage.getItem(TRACKER_STORAGE_KEY)
    if (!raw) return { data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: true }
    let parsed
    try { parsed = JSON.parse(raw) } catch { return { data: createTrackerData(defaultRoutines), recovered: true, migrated: false, available: true } }
    const migrated = migrateLegacy(parsed, defaultRoutines)
    if (migrated) return { data: migrated, recovered: false, migrated: true, available: true }
    if (!isValidData(parsed)) return { data: createTrackerData(defaultRoutines), recovered: true, migrated: false, available: true }
    return { data: normalizeData(parsed), recovered: false, migrated: false, available: true }
  } catch {
    return { data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: false }
  }
}

export function saveTrackerData(storage, data) {
  try { storage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(data)); return true } catch { return false }
}

export function serializeTrackerData(data) { return JSON.stringify(normalizeData(data), null, 2) }

export function parseTrackerImport(text) {
  let parsed
  try { parsed = JSON.parse(text) } catch { return { data: null, error: 'The selected file is not valid JSON.' } }
  if (!isValidData(parsed)) return { data: null, error: 'The selected file is not a valid version 3 wellness export.' }
  return { data: normalizeData(parsed), error: null }
}

function updateDay(data, localDate, mutate) {
  const current = cloneDay(data.days[localDate] ?? emptyDay())
  const nextDay = mutate(current)
  return { ...data, days: { ...data.days, [localDate]: cloneDay(nextDay) } }
}

export function updateMetricsForDate(data, localDate, values) {
  return updateDay(data, localDate, (day) => ({ ...day, steps: Math.max(0, Number(values.steps ?? day.steps)), waterMl: Math.max(0, Number(values.waterMl ?? day.waterMl)) }))
}

export function updateSleepForDate(data, localDate, sleep) {
  return updateDay(data, localDate, (day) => ({ ...day, sleep: { ...day.sleep, ...sleep } }))
}

export function addActivityForDate(data, localDate, activity) {
  return updateDay(data, localDate, (day) => ({ ...day, activities: [...day.activities, { ...activity, minutes: Math.max(0, Number(activity.minutes)) }] }))
}

export function addMealForDate(data, localDate, meal) {
  return updateDay(data, localDate, (day) => ({ ...day, meals: [...day.meals, { ...meal }] }))
}

export function removeEntryForDate(data, localDate, collection, id) {
  return updateDay(data, localDate, (day) => ({ ...day, [collection]: day[collection].filter((entry) => entry.id !== id) }))
}

export function toggleMedicationForDate(data, localDate, medicationId) {
  return updateDay(data, localDate, (day) => ({ ...day, medicationLogs: { ...day.medicationLogs, [medicationId]: day.medicationLogs[medicationId] ? null : new Date().toISOString() } }))
}

export function updateWellbeingForDate(data, localDate, wellbeing) {
  return updateDay(data, localDate, (day) => ({ ...day, wellbeing: { ...day.wellbeing, ...wellbeing } }))
}

export function updateCycleForDate(data, localDate, cycle) {
  return updateDay(data, localDate, (day) => ({ ...day, cycle: { ...day.cycle, ...cycle } }))
}

export function addSymptomForDate(data, localDate, symptom) {
  return updateDay(data, localDate, (day) => ({ ...day, symptoms: [...day.symptoms, { ...symptom }] }))
}

export function updateGoals(data, goals) { return { ...data, goals: { ...data.goals, ...goals } } }

export function updateMedications(data, medications) { return { ...data, medications: medications.map((item) => ({ ...item, weekdays: [...item.weekdays] })) } }
