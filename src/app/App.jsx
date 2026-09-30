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

function JournalLoading() {
  return <main className="page-content auth-page" id="main-content"><section className="auth-card"><p className="eyebrow">Journal</p><h1>Loading your journal…</h1><p>Your previous account entries stay hidden until this session is ready.</p></section></main>
}

export default function App() {
  const [view, setView] = useState('today')
  const auth = useAuth()
  const tracker = useTrackerData(routines, { userId: auth.session?.user.id, authLoading: auth.loading })
  const navigation = [['today', 'Today'], ['calendar', 'Calendar'], ['insights', 'Insights'], ['plans', 'Plans'], ['data', 'Data'], ['account', auth.session ? 'Account' : 'Sign in']]
  const journalReady = tracker.ready && tracker.owner === (auth.session?.user.id ?? 'guest')

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header"><button className="brand" type="button" onClick={() => setView('today')} aria-label="Routine Tracker home"><span aria-hidden="true">◒</span> Routine Tracker</button><nav aria-label="Primary navigation">{navigation.map(([id, label]) => <button className={view === id ? 'nav-button nav-button--selected' : 'nav-button'} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined} key={id}>{label}</button>)}</nav></header>
    {view !== 'account' && !journalReady && <JournalLoading />}
    {view === 'today' && journalReady && <TodayDashboard day={tracker.day} goals={tracker.goals} medications={tracker.medications} localDate={tracker.localDate} onUpdateMetrics={tracker.updateMetrics} onToggleMedication={tracker.toggleMedication} onNavigate={setView} recovered={tracker.recovered} available={tracker.available} />}
    {view === 'calendar' && journalReady && <CalendarView days={tracker.days} goals={tracker.goals} medications={tracker.medications} localDate={tracker.localDate} onUpdateMetrics={tracker.updateMetrics} onUpdateSleep={tracker.updateSleep} onAddActivity={tracker.addActivity} onAddMeal={tracker.addMeal} onRemoveEntry={tracker.removeEntry} onToggleMedication={tracker.toggleMedication} onUpdateWellbeing={tracker.updateWellbeing} onUpdateCycle={tracker.updateCycle} onAddSymptom={tracker.addSymptom} />}
    {view === 'insights' && journalReady && <InsightsView days={tracker.days} goals={tracker.goals} localDate={tracker.localDate} />}
    {view === 'plans' && journalReady && <PlansView goals={tracker.goals} medications={tracker.medications} onSaveGoals={tracker.saveGoals} onSaveMedications={tracker.saveMedications} />}
    {view === 'data' && journalReady && <DataManagement data={tracker.data} onImport={tracker.importData} cloudStatus={tracker.cloudStatus} signedIn={Boolean(auth.session)} owner={tracker.owner} />}
    {view === 'account' && <AuthView auth={auth} />}
  </div>
}
