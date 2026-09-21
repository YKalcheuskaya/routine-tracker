import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import ScheduleView from './ScheduleView'

const routine = { id: 'am-care', category: 'care', period: 'am', weekdays: ['monday', 'tuesday'], title: 'Gentle start', description: 'desc', steps: [{ id: 'one', title: 'Open a window' }] }

it('presents a read-only schedule with capitalized weekdays and no checkboxes', () => {
  render(<ScheduleView routines={[routine]} />)
  expect(screen.getByText(/Completion is available only in Today/)).toBeInTheDocument()
  const monday = screen.getByRole('tab', { name: 'Monday' })
  expect(monday).toHaveAttribute('aria-controls', 'schedule-panel')
  expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Monday')
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
})

it('supports expected arrow-key navigation between weekday tabs', async () => {
  render(<ScheduleView routines={[routine]} />)
  const monday = screen.getByRole('tab', { name: 'Monday' })
  monday.focus()
  await userEvent.keyboard('{ArrowRight}')
  const tuesday = screen.getByRole('tab', { name: 'Tuesday' })
  expect(tuesday).toHaveFocus()
  expect(tuesday).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Tuesday')
})
