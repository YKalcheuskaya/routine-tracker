/** Seven-day trends show manual records without claiming medical causation. */
import { buildWeeklyInsights, formatShortDate } from './wellness-insights'
import { formatMinutes } from '../wellness/wellness-model'

function ColumnChart({ title, values, suffix = '', tone }) {
  const max = Math.max(...values.map((item) => item.value), 1)
  return <section className="chart-card"><div><p className="eyebrow">Seven-day average</p><h2>{title}</h2></div><div className={`column-chart column-chart--${tone}`}>{values.map((item) => <div className="chart-column" key={item.date}><span style={{ height: `${Math.max(5, (item.value / max) * 100)}%` }} title={`${formatShortDate(item.date)}: ${item.value}${suffix}`} /><small>{formatShortDate(item.date).slice(0, 1)}</small></div>)}</div></section>
}

export default function InsightsView({ days, goals, localDate }) {
  const insights = buildWeeklyInsights(days, goals, localDate)
  const progressValues = insights.history.map((item) => ({ date: item.date, value: item.hasRecord ? item.score : 0 }))
  const waterValues = insights.history.map((item) => ({ date: item.date, value: item.waterMl }))
  const moodDays = insights.history.filter((item) => item.mood)
  const strongest = insights.history.reduce((best, item) => item.score > best.score ? item : best, insights.history[0])
  return <main className="page-content insights-page" id="main-content">
    <section className="insights-heading"><p className="eyebrow">Your week in numbers</p><h1>Weekly insights</h1><p>Patterns are based only on the entries you recorded. They describe trends, not medical causes or diagnoses.</p></section>
    <section className="insight-highlight"><div><span>Weekly progress</span><strong>{insights.averageProgress ?? '—'}</strong><small>/100 average</small></div><div><b>{insights.goalsCompleted} full-goal days</b><p>{strongest?.hasRecord ? `${formatShortDate(strongest.date)} was your strongest recorded day at ${strongest.score}.` : 'Add your first day to begin a trend.'}</p></div></section>
    <section className="chart-grid"><ColumnChart title="Goal progress" values={progressValues} suffix="%" tone="progress" /><ColumnChart title="Hydration" values={waterValues} suffix=" ml" tone="water" /></section>
    <section className="insight-cards"><article><p className="eyebrow">Sleep regularity</p><h2>{insights.sleepPlanNights} of 7 nights on plan</h2><p>Recorded range: {insights.sleepRangeLabel}</p><small>On plan means duration and bedtime matched your selected targets.</small></article><article><p className="eyebrow">Activity</p><h2>{insights.averageSteps ? insights.averageSteps.toLocaleString() : '—'} avg steps</h2><p>{insights.averageWater ? `${(insights.averageWater / 1000).toFixed(1)} L average water` : 'No hydration data yet'}</p><small>Goals remain user-selected and can be updated in Plans.</small></article><article><p className="eyebrow">Mood & stress</p><h2>{moodDays.length} mood check-ins</h2><p>{insights.averageStress !== null ? `Average recorded stress: ${insights.averageStress}/10` : 'Stress not logged yet'}</p><small>Use this as a reflection prompt, not a clinical assessment.</small></article></section>
  </main>
}
