/**
 * Read-only presentation for seven-day totals and category summaries. All
 * calculations are delegated to pure helpers so they can be tested independently.
 */
import { categoryMeta } from '../../data/routines'
import { buildSevenDayInsights, formatHistoryDate } from './history-insights'

function CompletionBar({ complete, total }) {
  const percentage = total ? Math.round((complete / total) * 100) : 0
  return <div className="completion-bar" role="img" aria-label={`${complete} of ${total} steps complete`}><span style={{ width: `${percentage}%` }} /></div>
}

export default function InsightsView({ days, routines, localDate }) {
  const insights = buildSevenDayInsights(days, routines, localDate)
  return (
    <main className="page-content" id="main-content">
      <section className="insights-header"><p className="eyebrow">Insights</p><h1>A gentle look back.</h1><p>See the last seven days without streaks, scores, or pressure. Your data stays in this browser.</p></section>
      <section className="insight-summary" aria-label="Seven-day summary"><article><strong>{insights.complete}</strong><span>steps completed</span></article><article><strong>{insights.total}</strong><span>steps available</span></article><article><strong>{insights.recordedDays}</strong><span>days represented</span></article></section>
      <section className="insights-section" aria-labelledby="daily-history-heading"><div className="section-heading"><div><p className="eyebrow">Daily history</p><h2 id="daily-history-heading">Last seven days</h2></div></div><div className="history-list">{insights.history.map((day) => <article className="history-row" key={day.date}><div><strong>{formatHistoryDate(day.date, localDate)}</strong><span>{day.hasRecord ? `${day.complete} of ${day.total} steps` : 'No saved activity'}</span></div><CompletionBar complete={day.complete} total={day.total} /><strong>{day.hasRecord ? `${day.percentage}%` : '—'}</strong></article>)}</div></section>
      <section className="insights-section" aria-labelledby="category-heading"><div className="section-heading"><div><p className="eyebrow">By category</p><h2 id="category-heading">Where your steps landed</h2></div></div><div className="category-insights">{Object.entries(categoryMeta).map(([category, meta]) => { const values = insights.categories[category]; return <article className={`category-card routine-card--${category}`} key={category}><p className="eyebrow"><span aria-hidden="true">{meta.icon}</span> {meta.label}</p><strong>{values.complete} of {values.total}</strong><CompletionBar complete={values.complete} total={values.total} /></article> })}</div></section>
    </main>
  )
}
