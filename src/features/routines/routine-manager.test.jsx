import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import RoutineManager from './routine-manager'

const routine = {
  id: 'am-care', category: 'care', period: 'am', weekdays: ['monday'], title: 'Gentle start', description: 'Start calmly.',
  steps: [{ id: 'one', title: 'Open a window' }],
}

it('validates and creates a routine through the accessible form', async () => {
  const onSave = vi.fn()
  render(<RoutineManager routines={[]} onSave={onSave} onDelete={() => {}} onRestore={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: 'Add routine' }))
  await userEvent.click(screen.getByRole('button', { name: 'Create routine' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Add a routine title.')
  await userEvent.type(screen.getByLabelText('Title'), 'Evening reset')
  await userEvent.type(screen.getByLabelText('Description'), 'Close the day calmly.')
  await userEvent.type(screen.getByLabelText('Step 1'), 'Close open tabs')
  await userEvent.click(screen.getByRole('button', { name: 'Create routine' }))
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'evening-reset', title: 'Evening reset' }))
})

it('requires confirmation before deleting a routine', async () => {
  const onDelete = vi.fn()
  render(<RoutineManager routines={[routine]} onSave={() => {}} onDelete={onDelete} onRestore={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Delete “Gentle start”?')
  expect(onDelete).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Delete routine' }))
  expect(onDelete).toHaveBeenCalledWith('am-care')
})

it('requires confirmation before restoring the demo library', async () => {
  const onRestore = vi.fn()
  render(<RoutineManager routines={[routine]} onSave={() => {}} onDelete={() => {}} onRestore={onRestore} />)
  await userEvent.click(screen.getByRole('button', { name: 'Restore demo routines' }))
  expect(onRestore).not.toHaveBeenCalled()
  await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Restore demo routines' }))
  expect(onRestore).toHaveBeenCalledOnce()
})
