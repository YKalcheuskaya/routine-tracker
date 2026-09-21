/**
 * Application composition root. It owns top-level navigation, creates the shared
 * tracker state, and connects each feature view to that state without duplicating
 * persistence or business rules inside the page components.
 */
import { useState } from 'react'
import { routines } from '../data/routines'
import TodayDashboard from '../features/dashboard/TodayDashboard'
import ScheduleView from '../features/schedule/ScheduleView'
import { useTrackerData } from '../features/tracker/use-tracker-data'
import RoutineManager from '../features/routines/routine-manager'
import InsightsView from '../features/insights/insights-view'
import DataManagement from '../features/tracker/data-management'

export default function App() {
  const [view, setView] = useState('today')
  const tracker = useTrackerData(routines)
  const navigation = [
    ['today', 'Today'],
    ['schedule', 'Schedule'],
    ['routines', 'Routines'],
    ['insights', 'Insights'],
    ['data', 'Data'],
  ]

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Routine Tracker home">
          <span aria-hidden="true">✦</span> Routine Tracker
        </a>
        <nav aria-label="Primary navigation">
          {navigation.map(([id, label]) => (
            <button
              className={view === id ? 'nav-button nav-button--selected' : 'nav-button'}
              onClick={() => setView(id)}
              aria-current={view === id ? 'page' : undefined}
              key={id}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {view === 'today' && <TodayDashboard routines={tracker.routines} progress={tracker} onToggle={tracker.toggle} />}
      {view === 'schedule' && <ScheduleView routines={tracker.routines} />}
      {view === 'routines' && (
        <RoutineManager
          routines={tracker.routines}
          onSave={tracker.saveRoutine}
          onDelete={tracker.deleteRoutine}
          onRestore={tracker.restoreDemoRoutines}
        />
      )}
      {view === 'insights' && <InsightsView days={tracker.days} routines={tracker.routines} localDate={tracker.localDate} />}
      {view === 'data' && <DataManagement data={tracker.data} onImport={tracker.importData} />}
    </div>
  )
}
