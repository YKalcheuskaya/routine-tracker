import { beforeEach, expect, it, vi } from 'vitest'
import { createTrackerData, parseTrackerImport } from '../tracker/tracker-storage'

const mocks = vi.hoisted(() => ({ maybeSingle: vi.fn(), upsert: vi.fn() }))

vi.mock('./supabase-client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }),
      upsert: mocks.upsert,
    }),
  },
}))

import { loadCloudSnapshot, saveCloudSnapshot } from './cloud-storage'

beforeEach(() => vi.clearAllMocks())

it('rejects a server journal that the import boundary rejects', async () => {
  const journal = createTrackerData([])
  journal.goals.steps = { invalid: true }
  expect(parseTrackerImport(JSON.stringify(journal)).error).not.toBeNull()
  mocks.maybeSingle.mockResolvedValue({ data: { journal }, error: null })
  await expect(loadCloudSnapshot('fictional-account')).rejects.toThrow('Invalid version 3 wellness journal')
})

it('validates a journal before attempting an upsert', async () => {
  const journal = createTrackerData([])
  journal.goals.steps = { invalid: true }
  await expect(saveCloudSnapshot('fictional-account', journal)).rejects.toThrow('Invalid version 3 wellness journal')
  expect(mocks.upsert).not.toHaveBeenCalled()
})
