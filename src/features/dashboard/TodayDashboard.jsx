/**
 * Derives the current day's AM/PM presentation from the routine library and the
 * tracker hook. This view renders state; storage and mutation remain outside it.
 */
import ProgressPill from '../../components/ProgressPill'
import { formatToday, getWeekday } from '../completion/date'
import { progressFor, routinesFor } from '../routines/selectors'
import PeriodSection from './PeriodSection'

export default function TodayDashboard({ routines, progress, onToggle, now = new Date() }) {
  const weekday = getWeekday(now)
  const am = routinesFor(routines, weekday, 'am')
  const pm = routinesFor(routines, weekday, 'pm')
  const total = progressFor([...am, ...pm], progress.completedStepIds)
  return (
    <main className="page-content" id="main-content">
      <section className="today-hero" aria-labelledby="today-heading">
        <div><p className="eyebrow">{formatToday(now)}</p><h1 id="today-heading">A little rhythm for your day.</h1><p>Three small lanes for care, movement, and focus — no pressure to make it perfect.</p></div>
        <ProgressPill complete={total.complete} total={total.total} label="steps complete today" />
      </section>
      {progress.recovered && <p className="notice" role="status">Saved progress was reset because it was no longer readable.</p>}
      {!progress.available && <p className="notice" role="status">Progress will stay in this session, but cannot be saved in this browser.</p>}
      <PeriodSection title="AM" routines={am} completedStepIds={progress.completedStepIds} onToggle={onToggle} />
      <PeriodSection title="PM" routines={pm} completedStepIds={progress.completedStepIds} onToggle={onToggle} />
    </main>
  )
}
