import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createTrackerData } from './tracker-storage'

const mocks = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }))

vi.mock('../cloud/supabase-client', () => ({ cloudConfigured: true }))
vi.mock('../cloud/cloud-storage', () => ({ loadCloudSnapshot: mocks.load, saveCloudSnapshot: mocks.save }))

import { useTrackerData } from './use-tracker-data'

const routines = []

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => { resolve = resolvePromise; reject = rejectPromise })
  return { promise, resolve, reject }
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  mocks.save.mockResolvedValue(undefined)
})
afterEach(cleanup)

it('keeps a failed cloud read local and never uploads fallback data', async () => {
  mocks.load.mockRejectedValue(new Error('temporary read failure'))
  const { result } = renderHook(() => useTrackerData(routines, { userId: 'account-a' }))
  await waitFor(() => expect(result.current.ready).toBe(true))
  expect(result.current.cloudStatus).toBe('error')
  expect(mocks.save).not.toHaveBeenCalled()

  act(() => result.current.updateMetrics('2026-09-30', { waterMl: 500 }))
  expect(result.current.data.days['2026-09-30'].waterMl).toBe(500)
  expect(mocks.save).not.toHaveBeenCalled()
})

it('retries one transient PostgREST clock-skew rejection before enabling sync', async () => {
  mocks.load.mockRejectedValueOnce({ code: 'PGRST303' }).mockResolvedValueOnce(createTrackerData([]))
  const { result } = renderHook(() => useTrackerData(routines, { userId: 'account-a' }))
  await waitFor(() => expect(result.current.cloudStatus).toBe('synced'), { timeout: 2000 })
  expect(mocks.load).toHaveBeenCalledTimes(2)
  expect(result.current.ready).toBe(true)
})

it('serializes rapid saves and persists the newest snapshot last', async () => {
  mocks.load.mockResolvedValue(createTrackerData([]))
  const { result } = renderHook(() => useTrackerData(routines, { userId: 'account-a' }))
  await waitFor(() => expect(result.current.cloudStatus).toBe('synced'))
  mocks.save.mockClear()

  const first = deferred()
  const second = deferred()
  mocks.save.mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise)
  act(() => result.current.updateMetrics('2026-09-30', { waterMl: 100 }))
  await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1))
  act(() => result.current.updateMetrics('2026-09-30', { waterMl: 200 }))
  expect(mocks.save).toHaveBeenCalledTimes(1)
  expect(result.current.cloudStatus).toBe('saving')

  await act(async () => { first.resolve(); await first.promise })
  await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2))
  expect(mocks.save.mock.calls[0][1].days['2026-09-30'].waterMl).toBe(100)
  expect(mocks.save.mock.calls[1][1].days['2026-09-30'].waterMl).toBe(200)
  await act(async () => { second.resolve(); await second.promise })
  await waitFor(() => expect(result.current.cloudStatus).toBe('synced'))
})

it('ignores an old account save callback while a new account loads', async () => {
  mocks.load.mockResolvedValue(createTrackerData([]))
  const { result, rerender } = renderHook(({ userId }) => useTrackerData(routines, { userId }), { initialProps: { userId: 'account-a' } })
  await waitFor(() => expect(result.current.cloudStatus).toBe('synced'))

  const oldSave = deferred()
  mocks.save.mockImplementationOnce(() => oldSave.promise)
  act(() => result.current.updateMetrics('2026-09-30', { waterMl: 100 }))
  await waitFor(() => expect(result.current.cloudStatus).toBe('saving'))

  const newLoad = deferred()
  mocks.load.mockImplementationOnce(() => newLoad.promise)
  rerender({ userId: 'account-b' })
  await waitFor(() => expect(result.current.cloudStatus).toBe('connecting'))
  await act(async () => { oldSave.resolve(); await oldSave.promise })
  expect(result.current.cloudStatus).toBe('connecting')

  await act(async () => { newLoad.resolve(createTrackerData([])); await newLoad.promise })
  await waitFor(() => expect(result.current.owner).toBe('account-b'))
  expect(result.current.cloudStatus).toBe('synced')
})
