import { describe, expect, it } from 'vitest'
import { addActivityForDate, createTrackerData, loadTrackerData, parseTrackerImport, saveTrackerData, serializeTrackerData, storageKeyForAccount, TRACKER_STORAGE_KEY, updateMetricsForDate, updateSleepForDate } from './tracker-storage'

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

describe('versioned wellness storage', () => {
  it('creates an isolated version-three local contract', () => {
    const data = createTrackerData([])
    expect(data.version).toBe(3)
    expect(data.goals.steps).toBe(10000)
    expect(data.medications).toHaveLength(0)
    expect(data.days).toEqual({})
  })

  it('migrates a version-two completion record without discarding it', () => {
    const legacy = { version: 2, routines: [], days: { '2026-09-21': { completedStepIds: ['am-care:one'], stepSnapshot: [] } } }
    const result = loadTrackerData(memoryStorage({ [TRACKER_STORAGE_KEY]: JSON.stringify(legacy) }), [])
    expect(result.migrated).toBe(true)
    expect(result.data.days['2026-09-21'].routineCompletedIds).toEqual(['am-care:one'])
  })

  it('persists structured manual entries by local calendar date', () => {
    let data = createTrackerData([])
    data = updateMetricsForDate(data, '2026-09-21', { steps: 8210, waterMl: 1750 })
    data = updateSleepForDate(data, '2026-09-21', { bedtime: '22:30', wakeTime: '06:30', minutes: 480, feeling: 'Rested' })
    data = addActivityForDate(data, '2026-09-21', { id: 'walk-1', type: 'Walking', minutes: 35, intensity: 'Moderate' })
    expect(data.days['2026-09-21']).toMatchObject({ steps: 8210, waterMl: 1750, sleep: { minutes: 480 }, activities: [{ type: 'Walking', minutes: 35 }] })
    const storage = memoryStorage()
    expect(saveTrackerData(storage, data)).toBe(true)
    expect(loadTrackerData(storage, []).data).toEqual(data)
  })

  it('keeps guest and account journals in separate browser-storage keys', () => {
    const storage = memoryStorage()
    const guest = updateMetricsForDate(createTrackerData([]), '2026-09-21', { waterMl: 250 })
    const account = updateMetricsForDate(createTrackerData([]), '2026-09-21', { waterMl: 1250 })
    expect(saveTrackerData(storage, guest)).toBe(true)
    expect(saveTrackerData(storage, account, storageKeyForAccount('fictional-account-a'))).toBe(true)
    expect(loadTrackerData(storage, [], TRACKER_STORAGE_KEY).data.days['2026-09-21'].waterMl).toBe(250)
    expect(loadTrackerData(storage, [], storageKeyForAccount('fictional-account-a')).data.days['2026-09-21'].waterMl).toBe(1250)
    expect(loadTrackerData(storage, [], storageKeyForAccount('fictional-account-b')).data.days).toEqual({})
  })

  it('exports only a valid version-three wellness contract', () => {
    const data = updateMetricsForDate(createTrackerData([]), '2026-09-21', { steps: 10, waterMl: 200 })
    expect(parseTrackerImport(serializeTrackerData(data))).toEqual({ data, error: null })
    expect(parseTrackerImport(JSON.stringify({ version: 2, routines: [], days: {} }))).toEqual({ data: null, error: 'The selected file is not a valid version 3 wellness export.' })
  })

  it('rejects malformed nested values without throwing or normalizing them', () => {
    const nullReminder = createTrackerData([])
    nullReminder.medications = [null]
    const invalidMeal = updateMetricsForDate(createTrackerData([]), '2026-09-21', { waterMl: 500 })
    invalidMeal.days['2026-09-21'].meals = [{ id: 'fictional-meal', type: 'Lunch', title: { invalid: true }, portion: '', time: '' }]
    const invalidSymptom = updateMetricsForDate(createTrackerData([]), '2026-09-21', { waterMl: 500 })
    invalidSymptom.days['2026-09-21'].symptoms = [null]

    expect(() => parseTrackerImport(JSON.stringify(nullReminder))).not.toThrow()
    expect(parseTrackerImport(JSON.stringify(nullReminder)).error).toContain('not a valid')
    expect(parseTrackerImport(JSON.stringify(invalidMeal)).error).toContain('not a valid')
    expect(parseTrackerImport(JSON.stringify(invalidSymptom)).error).toContain('not a valid')
  })

  it('recovers from malformed persisted nested data rather than exposing it to rendering', () => {
    const invalid = createTrackerData([])
    invalid.medications = [null]
    const result = loadTrackerData(memoryStorage({ [TRACKER_STORAGE_KEY]: JSON.stringify(invalid) }), [])
    expect(result.recovered).toBe(true)
    expect(result.data.days).toEqual({})
  })
})
