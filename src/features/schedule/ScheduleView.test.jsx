import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import ScheduleView from './ScheduleView'

it('presents a read-only schedule without checkboxes', () => { render(<ScheduleView routines={[{ id: 'am-care', category: 'care', period: 'am', weekdays: ['monday'], title: 'Gentle start', description: 'desc', steps: [{ id: 'one', title: 'Open a window' }] }]} />); expect(screen.getByText(/Completion is available only in Today/)).toBeInTheDocument(); expect(screen.queryByRole('checkbox')).not.toBeInTheDocument() })
