import { useState } from 'react'
import { categoryMeta } from '../../data/routines'
import { routinesFor } from '../routines/selectors'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function ReadOnlyCard({ routine }) {
  const meta = categoryMeta[routine.category]
  return <article className={`routine-card routine-card--${routine.category}`}><p className="eyebrow"><span aria-hidden="true">{meta.icon}</span> {meta.label}</p><h3>{routine.title}</h3><p className="routine-card__description">{routine.description}</p><ol className="readonly-list">{routine.steps.map((step) => <li key={step.id}><strong>{step.title}</strong>{step.detail && <small>{step.detail}</small>}</li>)}</ol></article>
}

export default function ScheduleView({ routines }) {
  const [day, setDay] = useState('monday')
  return <main className="page-content" id="main-content"><section className="schedule-header"><p className="eyebrow">Schedule</p><h1>A quiet look ahead.</h1><p>Browse the weekly template here. Completion is available only in Today, so your daily list can reset naturally.</p></section><div className="day-tabs" role="tablist" aria-label="Weekday schedule">{days.map((item) => <button key={item} role="tab" aria-selected={item === day} className={item === day ? 'day-tab day-tab--selected' : 'day-tab'} onClick={() => setDay(item)}>{item.slice(0, 3)}</button>)}</div>{['am', 'pm'].map((period) => <section className="period-section" key={period}><div className="period-section__heading"><p className="eyebrow">{period.toUpperCase()}</p><h2>{period === 'am' ? 'Morning rhythm' : 'Evening rhythm'}</h2></div><div className="routine-grid">{routinesFor(routines, day, period).map((routine) => <ReadOnlyCard routine={routine} key={routine.id} />)}</div></section>)}</main>
}
