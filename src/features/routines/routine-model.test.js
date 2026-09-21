import { expect, it } from 'vitest'
import { routineFromDraft } from './routine-model'

const validDraft = {
  id: '', title: 'Morning reset', description: 'Start calmly.', category: 'care', period: 'am', weekdays: ['monday'],
  steps: [{ id: '', title: 'Open a window', detail: 'Breathe.' }],
}

it('normalizes a valid routine draft into stable public data', () => {
  expect(routineFromDraft(validDraft, []).routine).toEqual({
    id: 'morning-reset', title: 'Morning reset', description: 'Start calmly.', category: 'care', period: 'am', weekdays: ['monday'],
    steps: [{ id: 'open-a-window', title: 'Open a window', detail: 'Breathe.' }],
  })
})

it('reports duplicate steps and generates a collision-safe routine ID', () => {
  const duplicate = routineFromDraft({ ...validDraft, steps: [{ id: '', title: 'Pause', detail: '' }, { id: '', title: 'Pause  ', detail: '' }] }, [])
  expect(duplicate.errors).toContain('Step names must be unique within a routine.')
  expect(routineFromDraft(validDraft, [{ id: 'morning-reset' }]).routine.id).toBe('morning-reset-2')
})

it('reports all required-field errors without creating a routine', () => {
  const result = routineFromDraft({ ...validDraft, title: ' ', description: '', weekdays: [], steps: [{ id: '', title: '', detail: '' }] }, [])
  expect(result.routine).toBeNull()
  expect(result.errors).toEqual(['Add a routine title.', 'Add a short description.', 'Choose at least one weekday.', 'Every routine needs at least one named step.'])
})
