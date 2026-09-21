import { useRef, useState } from 'react'
import { categoryMeta } from '../../data/routines'
import { routinesFor } from '../routines/selectors'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function ReadOnlyCard({ routine }) {
  const meta = categoryMeta[routine.category]
  return <article className={`routine-card routine-card--${routine.category}`}><p className="eyebrow"><span aria-hidden="true">{meta.icon}</span> {meta.label}</p><h3>{routine.title}</h3><p className="routine-card__description">{routine.description}</p><ol className="readonly-list">{routine.steps.map((step) => <li key={step.id}><strong>{step.title}</strong>{step.detail && <small>{step.detail}</small>}</li>)}</ol></article>
}

function formatDay(day) {
  return `${day.charAt(0).toUpperCase()}${day.slice(1)}`
}

export default function ScheduleView({ routines }) {
  const [day, setDay] = useState('monday')
  const tabRefs = useRef([])

  function selectDay(nextDay) {
    setDay(nextDay)
    tabRefs.current[days.indexOf(nextDay)]?.focus()
  }

  function handleKeyDown(event, index) {
    let nextIndex
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % days.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + days.length) % days.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = days.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    selectDay(days[nextIndex])
  }

  return (
    <main className="page-content" id="main-content">
      <section className="schedule-header">
        <p className="eyebrow">Schedule</p>
        <h1>A quiet look ahead.</h1>
        <p>Browse the weekly template here. Completion is available only in Today, so your daily list can reset naturally.</p>
      </section>
      <div className="day-tabs" role="tablist" aria-label="Weekday schedule">
        {days.map((item, index) => (
          <button
            key={item}
            ref={(node) => { tabRefs.current[index] = node }}
            id={`schedule-tab-${item}`}
            role="tab"
            aria-controls="schedule-panel"
            aria-selected={item === day}
            tabIndex={item === day ? 0 : -1}
            className={item === day ? 'day-tab day-tab--selected' : 'day-tab'}
            onClick={() => setDay(item)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {formatDay(item)}
          </button>
        ))}
      </div>
      <div id="schedule-panel" role="tabpanel" aria-labelledby={`schedule-tab-${day}`}>
        {['am', 'pm'].map((period) => (
          <section className="period-section" key={period}>
            <div className="period-section__heading">
              <p className="eyebrow">{period.toUpperCase()}</p>
              <h2>{period === 'am' ? 'Morning rhythm' : 'Evening rhythm'}</h2>
            </div>
            <div className="routine-grid">
              {routinesFor(routines, day, period).map((routine) => <ReadOnlyCard routine={routine} key={routine.id} />)}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
