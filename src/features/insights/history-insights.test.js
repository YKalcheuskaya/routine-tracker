import { expect, it } from 'vitest'
import { buildSevenDayInsights, recentLocalDates, summarizeRecord } from './history-insights'

it('builds seven local calendar dates across a month boundary', () => {
  expect(recentLocalDates('2026-10-02', 4)).toEqual(['2026-10-02', '2026-10-01', '2026-09-30', '2026-09-29'])
})

it('summarizes completion with category-level independent totals', () => {
  const result = summarizeRecord({ completedStepIds: ['a', 'c'], stepSnapshot: [{ id: 'a', category: 'care' }, { id: 'b', category: 'care' }, { id: 'c', category: 'focus' }] })
  expect(result).toEqual({
    complete: 2, total: 3, percentage: 67,
    categories: { care: { complete: 1, total: 2 }, move: { complete: 0, total: 0 }, focus: { complete: 1, total: 1 } },
  })
})

it('uses the current routine snapshot only for today and preserves stored historical snapshots', () => {
  const routines = [{ id: 'now', category: 'move', period: 'am', weekdays: ['monday'], title: 'Move', description: 'desc', steps: [{ id: 'one', title: 'Walk' }] }]
  const days = { '2026-09-20': { completedStepIds: ['old:one'], stepSnapshot: [{ id: 'old:one', category: 'care' }, { id: 'old:two', category: 'care' }] } }
  const result = buildSevenDayInsights(days, routines, '2026-09-21')
  expect(result.history[0]).toMatchObject({ date: '2026-09-21', complete: 0, total: 1, hasRecord: true })
  expect(result.history[1]).toMatchObject({ date: '2026-09-20', complete: 1, total: 2, hasRecord: true })
  expect(result.history[2]).toMatchObject({ complete: 0, total: 0, hasRecord: false })
  expect(result.categories.care).toEqual({ complete: 1, total: 2 })
})
