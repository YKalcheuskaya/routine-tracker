import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TodayDashboard from './TodayDashboard'
import { emptyDay } from '../wellness/wellness-model'

describe('Today dashboard', () => {
  it('shows every goal and check-in in compact groups', () => {
    const day = emptyDay()
    day.steps = 8000
    day.waterMl = 1200
    render(<TodayDashboard day={day} goals={{ steps: 10000, waterMl: 2000, sleepMinutes: 480, meals: 3 }} medications={[]} localDate="2026-09-21" onUpdateMetrics={() => {}} onToggleMedication={() => {}} onNavigate={() => {}} available />)
    expect(screen.getByRole('heading', { name: 'Goals' })).toBeInTheDocument()
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Check-ins' })).toBeInTheDocument()
    expect(screen.getAllByText('Mood & stress')).toHaveLength(2)
  })

  it('offers a quick hydration action and routes full edits to Calendar', async () => {
    const updateMetrics = vi.fn()
    const navigate = vi.fn()
    render(<TodayDashboard day={emptyDay()} goals={{ steps: 10000, waterMl: 2000, sleepMinutes: 480, meals: 3 }} medications={[]} localDate="2026-09-21" onUpdateMetrics={updateMetrics} onToggleMedication={() => {}} onNavigate={navigate} available />)
    await userEvent.click(screen.getByRole('button', { name: /quick add/i }))
    await userEvent.click(screen.getByRole('button', { name: /250 ml water/i }))
    expect(updateMetrics).toHaveBeenCalledWith('2026-09-21', { waterMl: 250 })
    await userEvent.click(screen.getByRole('button', { name: /view full day/i }))
    expect(navigate).toHaveBeenCalledWith('calendar')
  })
})
