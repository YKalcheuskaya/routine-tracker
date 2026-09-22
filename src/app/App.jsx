/** Application composition root for the local-first wellness tracker. */
import { useState } from 'react'
import { routines } from '../data/routines'
import TodayDashboard from '../features/dashboard/TodayDashboard'
import CalendarView from '../features/calendar/calendar-view'
import InsightsView from '../features/insights/insights-view'
import PlansView from '../features/plans/plans-view'
import DataManagement from '../features/tracker/data-management'
import { useTrackerData } from '../features/tracker/use-tracker-data'
import { useAuth } from '../features/cloud/use-auth'
import AuthView from '../features/cloud/auth-view'

export default function App() {
  const [view, setView] = useState('today')
  const auth = useAuth()
  const tracker = useTrackerData(routines, auth.session?.user.id)
  const navigation = [['today', 'Today'], ['calendar', 'Calendar'], ['insights', 'Insights'], ['plans', 'Plans'], ['data', 'Data'], ['account', auth.session ? 'Account' : 'Sign in']]

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header"><button className="brand" type="button" onClick={() => setView('today')} aria-label="Routine Tracker home"><span aria-hidden="true">◒</span> Routine Tracker</button><nav aria-label="Primary navigation">{navigation.map(([id, label]) => <button className={view === id ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined} key={id}>{label}</button>)}</nav></header>
    {view === 'today' && <TodayDashboard day={tracker.day} goals={tracker.goals} medications={tracker.medications} localDate={tracker.localDate} onUpdateMetrics={tracker.updateMetrics} onToggleMedication={tracker.toggleMedication} onNavigate={setView} recovered={tracker.recovered} available={tracker.available} />}
    {view === 'calendar' && <CalendarView days={tracker.days} goals={tracker.goals} medications={tracker.medications} localDate={tracker.localDate} onUpdateMetrics={tracker.updateMetrics} onUpdateSleep={tracker.updateSleep} onAddActivity={tracker.addActivity} onAddMeal={tracker.addMeal} onRemoveEntry={tracker.removeEntry} onToggleMedication={tracker.toggleMedication} onUpdateWellbeing={tracker.updateWellbeing} onUpdateCycle={tracker.updateCycle} onAddSymptom={tracker.addSymptom} />}
    {view === 'insights' && <InsightsView days={tracker.days} goals={tracker.goals} localDate={tracker.localDate} />}
    {view === 'plans' && <PlansView goals={tracker.goals} medications={tracker.medications} onSaveGoals={tracker.saveGoals} onSaveMedications={tracker.saveMedications} />}
    {view === 'data' && <DataManagement data={tracker.data} onImport={tracker.importData} cloudStatus={tracker.cloudStatus} signedIn={Boolean(auth.session)} />}
    {view === 'account' && <AuthView auth={auth} />}
  </div>
}
