/** Compact home view: every category is visible, while the full journal lives in Calendar. */
import { useState } from 'react'
import MetricGlyph from '../../components/MetricGlyph'
import morningHero from '../../assets/hero-morning.png'
import dayHero from '../../assets/hero-day.png'
import eveningHero from '../../assets/hero-evening.png'
import nightHero from '../../assets/hero-night.png'
import { emptyDay, dailyProgress, formatMinutes } from '../wellness/wellness-model'
import { getWeekday } from '../completion/date'

function heroForHour(hour) {
  if (hour < 7) return { image: nightHero, label: 'Night', message: 'Reflect, reset, and prepare for tomorrow.' }
  if (hour < 11) return { image: morningHero, label: 'Morning', message: 'Start strong. Your day is ready.' }
  if (hour < 17) return { image: dayHero, label: 'Day', message: 'Keep your momentum going.' }
  if (hour < 22) return { image: eveningHero, label: 'Evening', message: 'Strong progress today.' }
  return { image: nightHero, label: 'Night', message: 'Reflect, reset, and prepare for tomorrow.' }
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(date)
}

function GoalRow({ row }) {
  return <li className="status-row"><MetricGlyph name={row.tone} /><div className="status-row__body"><strong>{row.label}</strong><span>{row.value}</span><div className="mini-progress" role="progressbar" aria-label={`${row.label}: ${row.percent}% of selected goal`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={row.percent}><span style={{ width: `${row.percent}%` }} /></div></div><b>{row.percent}%</b></li>
}

export default function TodayDashboard({ day, goals, medications, localDate, onUpdateMetrics, onToggleMedication, onNavigate, recovered, available }) {
  const [quickOpen, setQuickOpen] = useState(false)
  const now = new Date()
  const hero = heroForHour(now.getHours())
  const currentDay = day ?? emptyDay()
  const progress = dailyProgress(currentDay, goals)
  const dueMedications = medications.filter((item) => item.weekdays.includes(getWeekday(now)))
  const checkIns = [
    { icon: 'medication', label: 'Medication', value: dueMedications.length === 0 ? 'No medication scheduled' : dueMedications.every((item) => currentDay.medicationLogs[item.id]) ? `${dueMedications.length} recorded` : `${dueMedications.filter((item) => !currentDay.medicationLogs[item.id]).length} remaining` },
    { icon: 'mood', label: 'Mood & stress', value: currentDay.wellbeing.mood ? `${currentDay.wellbeing.mood} · ${currentDay.wellbeing.stress ?? '—'}/10` : 'Not logged' },
    { icon: 'cycle', label: 'Cycle', value: currentDay.cycle.day ? `Day ${currentDay.cycle.day}` : 'Not logged' },
    { icon: 'symptoms', label: 'Symptoms', value: currentDay.symptoms.length ? `${currentDay.symptoms.length} logged` : 'None recorded' },
  ]

  return <main className="page-content today-page" id="main-content">
    <section className="today-hero-v2" style={{ '--hero-image': `url(${hero.image})` }} aria-labelledby="today-heading">
      <div className="hero-content"><p className="eyebrow">{hero.label} · {formatDate(now)}</p><h1 id="today-heading">Today</h1><p className="hero-message">{hero.message}</p></div>
      <div className="progress-orbit" aria-label={`Daily progress ${progress.score} percent`}><span>Daily progress</span><strong>{progress.score}</strong><small>/100</small></div>
      <p className="hero-summary">{progress.complete} goals complete · {progress.inProgress} in progress · {checkIns.filter((item) => item.value === 'Not logged' || item.value.includes('remaining')).length} check-ins remaining</p>
    </section>

    {recovered && <p className="notice" role="status">Saved entries were reset because the stored file could not be read.</p>}
    {!available && <p className="notice" role="status">This browser cannot save entries; this session remains private but temporary.</p>}

    <section className="today-status" aria-labelledby="goals-heading"><div className="section-title"><div><p className="eyebrow">Today at a glance</p><h2 id="goals-heading">Goals</h2></div><span>{progress.complete} complete · {progress.inProgress} in progress</span></div><ul className="status-list">{progress.rows.map((row) => <GoalRow row={row} key={row.id} />)}</ul></section>

    <section className="today-status" aria-labelledby="checkins-heading"><div className="section-title"><div><p className="eyebrow">Context, not scoring</p><h2 id="checkins-heading">Check-ins</h2></div><span>{formatMinutes(currentDay.sleep.minutes ?? 0) !== '0h' ? 'Sleep logged' : 'Manual entries'}</span></div><ul className="status-list">{checkIns.map((item) => <li className="status-row status-row--simple" key={item.label}><MetricGlyph name={item.icon} /><strong>{item.label}</strong><span>{item.value}</span><button className="row-link" type="button" onClick={() => onNavigate('calendar')}>Edit<span className="visually-hidden"> {item.label}</span></button></li>)}</ul></section>

    {quickOpen && <section className="quick-panel" aria-label="Quick add"><p>Add a small update now, or open the complete day journal.</p><div><button className="quick-choice" type="button" onClick={() => onUpdateMetrics(localDate, { waterMl: currentDay.waterMl + 250 })}>+ 250 ml water</button>{dueMedications.filter((item) => !currentDay.medicationLogs[item.id]).map((item) => <button className="quick-choice" type="button" key={item.id} onClick={() => onToggleMedication(localDate, item.id)}>Record {item.label}</button>)}</div></section>}
    <div className="today-actions"><button className="quick-add" type="button" aria-expanded={quickOpen} onClick={() => setQuickOpen((value) => !value)}>＋ Quick add</button><button className="full-day-link" type="button" onClick={() => onNavigate('calendar')}>View full day →</button></div>
  </main>
}
