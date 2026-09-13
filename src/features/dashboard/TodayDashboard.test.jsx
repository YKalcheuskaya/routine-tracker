import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TodayDashboard from './TodayDashboard'

const now = new Date(2026, 8, 13, 12)
const routine = { id: 'am-care', category: 'care', period: 'am', weekdays: ['sunday'], title: 'Gentle start', description: 'desc', steps: [{ id: 'one', title: 'Open a window' }] }
const progress = { completedStepIds: [], recovered: false, available: true }

describe('Today dashboard', () => {
  it('renders AM and PM sections and toggles a step', async () => { const onToggle = vi.fn(); render(<TodayDashboard routines={[routine]} progress={progress} onToggle={onToggle} now={now} />); await userEvent.click(screen.getByRole('checkbox', { name: 'Complete: Open a window' })); expect(onToggle).toHaveBeenCalledWith('am-care:one'); expect(screen.getByText('No routines are planned for this part of the day yet.')).toBeInTheDocument() })
  it('shows a completion state when all displayed steps are done', () => { render(<TodayDashboard routines={[routine]} progress={{ ...progress, completedStepIds: ['am-care:one'] }} onToggle={() => {}} now={now} />); expect(screen.getAllByText('All done!').length).toBeGreaterThan(0) })
})
