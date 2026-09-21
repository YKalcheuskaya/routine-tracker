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
  return <div className="app-shell"><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><a className="brand" href="/" aria-label="Routine Tracker home"><span aria-hidden="true">✦</span> Routine Tracker</a><nav aria-label="Primary navigation"><button className={view === 'today' ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView('today')} aria-current={view === 'today' ? 'page' : undefined}>Today</button><button className={view === 'schedule' ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView('schedule')} aria-current={view === 'schedule' ? 'page' : undefined}>Schedule</button><button className={view === 'routines' ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView('routines')} aria-current={view === 'routines' ? 'page' : undefined}>Routines</button><button className={view === 'insights' ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView('insights')} aria-current={view === 'insights' ? 'page' : undefined}>Insights</button><button className={view === 'data' ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView('data')} aria-current={view === 'data' ? 'page' : undefined}>Data</button></nav></header>{view === 'today' && <TodayDashboard routines={tracker.routines} progress={tracker} onToggle={tracker.toggle} />}{view === 'schedule' && <ScheduleView routines={tracker.routines} />}{view === 'routines' && <RoutineManager routines={tracker.routines} onSave={tracker.saveRoutine} onDelete={tracker.deleteRoutine} onRestore={tracker.restoreDemoRoutines} />}{view === 'insights' && <InsightsView days={tracker.days} routines={tracker.routines} localDate={tracker.localDate} />}{view === 'data' && <DataManagement data={tracker.data} onImport={tracker.importData} />}</div>
}
