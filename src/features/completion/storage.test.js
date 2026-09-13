import { describe, expect, it } from 'vitest'
import { emptyProgress, loadProgress, saveProgress, STORAGE_KEY } from './storage'

function memoryStorage(initial = {}) { const values = new Map(Object.entries(initial)); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } }

describe('daily progress storage', () => {
  it('uses a fresh state when the saved date is not today', () => { const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ ...emptyProgress('2026-09-12'), completedStepIds: ['a'] }) }); expect(loadProgress(storage, '2026-09-13').progress).toEqual(emptyProgress('2026-09-13')) })
  it('recovers safely from malformed data', () => { const storage = memoryStorage({ [STORAGE_KEY]: '{bad json' }); const result = loadProgress(storage, '2026-09-13'); expect(result.recovered).toBe(true); expect(result.available).toBe(true) })
  it('rejects an invalid versioned contract', () => { const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ version: 99, localDate: '2026-09-13', completedStepIds: [] }) }); expect(loadProgress(storage, '2026-09-13').recovered).toBe(true) })
  it('writes a valid progress document', () => { const storage = memoryStorage(); const progress = { ...emptyProgress('2026-09-13'), completedStepIds: ['am-care:open-window'] }; expect(saveProgress(storage, progress)).toBe(true); expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual(progress) })
})
