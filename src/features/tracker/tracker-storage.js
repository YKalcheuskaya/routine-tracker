/**
 * Versioned local persistence for the wellness tracker. Health entries remain
 * in this browser; this layer validates, migrates, and immutably updates them.
 */
import { defaultGoals, defaultMedications, emptyDay } from '../wellness/wellness-model'

// The previous shared key is deliberately never loaded: it has no trustworthy
// owner after a browser session expires. Guest and account journals now differ.
export const TRACKER_STORAGE_KEY = 'routine-tracker:guest-progress'
export const TRACKER_STORAGE_VERSION = 3

export function storageKeyForAccount(userId) {
  return `routine-tracker:account:${encodeURIComponent(userId)}`
}

function cloneRoutines(routines = []) {
  return routines.map((routine) => ({ ...routine, weekdays: [...routine.weekdays], steps: routine.steps.map((step) => ({ ...step })) }))
}

function isObject(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value) }
function validTime(value) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) }
function validOptionalTime(value) { return value === '' || validTime(value) }
function validOptionalNumber(value, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) { return value === null || (Number.isFinite(value) && value >= minimum && value <= maximum) }
function validString(value) { return typeof value === 'string' }

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

function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const parsed = new Date(`${date}T12:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(date)
}
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0 }
function nonNegative(value) { return Number.isFinite(value) && value >= 0 }

function validRoutine(routine) {
  return isObject(routine) && nonEmpty(routine.id) && nonEmpty(routine.category) && nonEmpty(routine.period)
    && nonEmpty(routine.title) && validString(routine.description) && Array.isArray(routine.weekdays)
    && routine.weekdays.every((weekday) => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(weekday))
    && Array.isArray(routine.steps) && routine.steps.every((step) => isObject(step) && nonEmpty(step.id) && nonEmpty(step.title) && (step.detail === undefined || validString(step.detail)))
}

function validSleep(sleep) {
  return isObject(sleep) && validOptionalTime(sleep.bedtime) && validOptionalTime(sleep.wakeTime)
    && validOptionalNumber(sleep.minutes, 0, 24 * 60) && validString(sleep.feeling)
}

function validActivity(item) { return isObject(item) && nonEmpty(item.id) && nonEmpty(item.type) && nonNegative(item.minutes) && validString(item.intensity) && (item.note === undefined || validString(item.note)) }
function validMeal(item) { return isObject(item) && nonEmpty(item.id) && nonEmpty(item.type) && nonEmpty(item.title) && validString(item.portion) && validOptionalTime(item.time) }
function validSymptom(item) { return isObject(item) && nonEmpty(item.id) && nonEmpty(item.name) && nonEmpty(item.severity) }
function validMedicationLog(value) { return value === null || (validString(value) && Number.isFinite(Date.parse(value))) }

function isValidDay(day) {
  return isObject(day)
    && nonNegative(day.steps) && nonNegative(day.waterMl)
    && validSleep(day.sleep)
    && Array.isArray(day.activities) && day.activities.every(validActivity)
    && Array.isArray(day.meals) && day.meals.every(validMeal)
    && isObject(day.medicationLogs) && Object.values(day.medicationLogs).every(validMedicationLog)
    && isObject(day.wellbeing) && validString(day.wellbeing.mood) && validOptionalNumber(day.wellbeing.stress, 0, 10) && validOptionalNumber(day.wellbeing.energy, 0, 10) && validString(day.wellbeing.note)
    && isObject(day.cycle) && validOptionalNumber(day.cycle.day, 1, 366) && validString(day.cycle.flow) && Array.isArray(day.cycle.menopauseSymptoms) && day.cycle.menopauseSymptoms.every(nonEmpty)
    && Array.isArray(day.symptoms) && day.symptoms.every(validSymptom)
    && Array.isArray(day.routineCompletedIds) && day.routineCompletedIds.every(nonEmpty)
}

function isValidData(value) {
  return isObject(value) && value.version === TRACKER_STORAGE_VERSION
    && isObject(value.goals)
    && Object.entries(defaultGoals).every(([key]) => key === 'bedtime' ? validTime(value.goals[key]) : Number.isFinite(value.goals[key]) && value.goals[key] >= 0)
    && Array.isArray(value.medications) && value.medications.every((item) => isObject(item) && nonEmpty(item.id) && nonEmpty(item.label) && validTime(item.time) && Array.isArray(item.weekdays) && item.weekdays.every((weekday) => Number.isInteger(weekday) && weekday >= 0 && weekday <= 6))
    && Array.isArray(value.routines) && value.routines.every(validRoutine)
    && isObject(value.days)
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

export function loadTrackerData(storage, defaultRoutines, storageKey = TRACKER_STORAGE_KEY) {
  try {
    const raw = storage.getItem(storageKey)
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

export function saveTrackerData(storage, data, storageKey = TRACKER_STORAGE_KEY) {
  try { storage.setItem(storageKey, JSON.stringify(data)); return true } catch { return false }
}

export function serializeTrackerData(data) { return JSON.stringify(normalizeData(data), null, 2) }

export function parseTrackerImport(text) {
  let parsed
  try { parsed = JSON.parse(text) } catch { return { data: null, error: 'The selected file is not valid JSON.' } }
  if (!isValidData(parsed)) return { data: null, error: 'The selected file is not a valid version 3 wellness export.' }
  try { return { data: normalizeData(parsed), error: null } } catch { return { data: null, error: 'The selected file could not be safely read.' } }
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
