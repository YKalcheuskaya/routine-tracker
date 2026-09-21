import { describe, expect, it } from 'vitest'
import { createTrackerData, loadTrackerData, parseTrackerImport, saveTrackerData, serializeTrackerData, stepSnapshotFor, toggleStepForDate, TRACKER_STORAGE_KEY } from './tracker-storage'

const routines = [{
  id: 'am-care', category: 'care', period: 'am', weekdays: ['monday'], title: 'Gentle start', description: 'desc',
  steps: [{ id: 'one', title: 'Open a window' }, { id: 'two', title: 'Drink water' }],
}]

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

describe('versioned tracker storage', () => {
  it('creates an isolated version-two data contract', () => {
    const data = createTrackerData(routines)
    expect(data).toEqual({ version: 2, routines, days: {} })
    data.routines[0].steps[0].title = 'Changed'
    expect(routines[0].steps[0].title).toBe('Open a window')
  })

  it('migrates a valid version-one daily record with a historical snapshot', () => {
    const legacy = { version: 1, localDate: '2026-09-21', completedStepIds: ['am-care:one', 'am-care:one', 'missing'] }
    const result = loadTrackerData(memoryStorage({ [TRACKER_STORAGE_KEY]: JSON.stringify(legacy) }), routines)
    expect(result.migrated).toBe(true)
    expect(result.data.days['2026-09-21']).toEqual({
      completedStepIds: ['am-care:one'],
      stepSnapshot: [
        { id: 'am-care:one', category: 'care' },
        { id: 'am-care:two', category: 'care' },
      ],
    })
  })

  it('recovers to demo data when stored content is malformed', () => {
    const result = loadTrackerData(memoryStorage({ [TRACKER_STORAGE_KEY]: '{broken' }), routines)
    expect(result.recovered).toBe(true)
    expect(result.data).toEqual(createTrackerData(routines))
  })

  it('rejects an invalid version-two routine contract', () => {
    const invalid = { version: 2, routines: [{ ...routines[0], weekdays: [] }], days: {} }
    const result = loadTrackerData(memoryStorage({ [TRACKER_STORAGE_KEY]: JSON.stringify(invalid) }), routines)
    expect(result.recovered).toBe(true)
  })

  it('toggles only an available step and stores the full daily snapshot', () => {
    const data = createTrackerData(routines)
    const changed = toggleStepForDate(data, '2026-09-21', 'am-care:one')
    expect(changed.days['2026-09-21']).toEqual({
      completedStepIds: ['am-care:one'],
      stepSnapshot: stepSnapshotFor(routines, '2026-09-21'),
    })
    expect(toggleStepForDate(changed, '2026-09-21', 'missing')).toBe(changed)
  })

  it('writes and reloads the version-two contract', () => {
    const storage = memoryStorage()
    const data = toggleStepForDate(createTrackerData(routines), '2026-09-21', 'am-care:two')
    expect(saveTrackerData(storage, data)).toBe(true)
    expect(loadTrackerData(storage, routines).data).toEqual(data)
  })

  it('serializes and validates a portable version-two export', () => {
    const data = toggleStepForDate(createTrackerData(routines), '2026-09-21', 'am-care:one')
    expect(parseTrackerImport(serializeTrackerData(data))).toEqual({ data, error: null })
  })

  it('rejects malformed and incompatible imports without producing replacement data', () => {
    expect(parseTrackerImport('{broken')).toEqual({ data: null, error: 'The selected file is not valid JSON.' })
    expect(parseTrackerImport(JSON.stringify({ version: 99, routines: [], days: {} }))).toEqual({ data: null, error: 'The selected file is not a valid Routine Tracker version 2 export.' })
  })
})
