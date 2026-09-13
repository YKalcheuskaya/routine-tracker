import { useState } from 'react'
import { routines } from '../data/routines'
import { useDailyProgress } from '../features/completion/useDailyProgress'
import TodayDashboard from '../features/dashboard/TodayDashboard'
import ScheduleView from '../features/schedule/ScheduleView'

export default function App() {
  const [view, setView] = useState('today')
  const progress = useDailyProgress()
  return <div className="app-shell"><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><a className="brand" href="/" aria-label="Routine Tracker home"><span aria-hidden="true">✦</span> Routine Tracker</a><nav aria-label="Primary navigation"><button className={view === 'today' ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView('today')} aria-current={view === 'today' ? 'page' : undefined}>Today</button><button className={view === 'schedule' ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView('schedule')} aria-current={view === 'schedule' ? 'page' : undefined}>Schedule</button></nav></header>{view === 'today' ? <TodayDashboard routines={routines} progress={progress} onToggle={progress.toggle} /> : <ScheduleView routines={routines} />}</div>
}
