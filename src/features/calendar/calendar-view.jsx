/** Date-specific journal and editing surface for manual wellness entries. */
import { useEffect, useState } from 'react'
import MetricGlyph from '../../components/MetricGlyph'
import { activityTypes, emptyDay, feelingOptions, formatMinutes, minutesFromTimes, moodOptions, sleepSummary } from '../wellness/wellness-model'

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

function displayDate(value) { return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${value}T12:00:00`)) }
function optionalNumber(value, minimum, maximum, apply) {
  if (value === '') { apply(null); return true }
  const number = Number(value)
  if (Number.isFinite(number) && number >= minimum && number <= maximum) { apply(number); return true }
  return false
}

export default function CalendarView({ days, goals, medications, localDate, onUpdateMetrics, onUpdateSleep, onAddActivity, onAddMeal, onRemoveEntry, onToggleMedication, onUpdateWellbeing, onUpdateCycle, onAddSymptom }) {
  const [date, setDate] = useState(localDate)
  const day = days[date] ?? emptyDay()
  const [metrics, setMetrics] = useState({ steps: day.steps, waterMl: day.waterMl })
  const [sleep, setSleep] = useState(day.sleep)
  const [activity, setActivity] = useState({ type: 'Walking', minutes: 30, intensity: 'Moderate', note: '' })
  const [meal, setMeal] = useState({ type: 'Breakfast', title: '', portion: '', time: '' })
  const [symptom, setSymptom] = useState({ name: '', severity: 'Mild' })

  useEffect(() => {
    setMetrics({ steps: day.steps, waterMl: day.waterMl })
    setSleep({ bedtime: day.sleep.bedtime, wakeTime: day.sleep.wakeTime, minutes: day.sleep.minutes, feeling: day.sleep.feeling })
  }, [date, day.steps, day.waterMl, day.sleep.bedtime, day.sleep.wakeTime, day.sleep.minutes, day.sleep.feeling])
  const sleepState = sleepSummary({ ...day, sleep }, goals)

  function saveMetrics(event) { event.preventDefault(); onUpdateMetrics(date, metrics) }
  function saveSleep(event) { event.preventDefault(); onUpdateSleep(date, { ...sleep, minutes: minutesFromTimes(sleep.bedtime, sleep.wakeTime) }) }
  function addActivity(event) { event.preventDefault(); onAddActivity(date, activity); setActivity({ type: 'Walking', minutes: 30, intensity: 'Moderate', note: '' }) }
  function addMeal(event) { event.preventDefault(); if (!meal.title.trim()) return; onAddMeal(date, meal); setMeal({ type: 'Breakfast', title: '', portion: '', time: '' }) }
  function addSymptom(event) { event.preventDefault(); if (!symptom.name.trim()) return; onAddSymptom(date, symptom); setSymptom({ name: '', severity: 'Mild' }) }

  return <main className="page-content calendar-page" id="main-content">
    <section className="calendar-heading"><div><p className="eyebrow">Daily log</p><h1>Calendar</h1><p>Select any day to record, review, or correct your own entries.</p></div><label className="date-picker">Choose date<input type="date" value={date} max={localDate} onChange={(event) => { if (event.target.value) setDate(event.target.value); else event.target.value = date }} /></label></section>
    <p className="selected-date">{displayDate(date)}</p>

    <section className="editor-grid">
      <form className="journal-card" onSubmit={saveMetrics}><div className="journal-card__heading"><MetricGlyph name="activity" /><div><h2>Activity & hydration</h2><p>Manual progress toward your selected goals.</p></div></div><div className="two-fields"><label>Steps<input type="number" min="0" value={metrics.steps} onChange={(event) => setMetrics({ ...metrics, steps: event.target.value })} /></label><label>Water (ml)<input type="number" min="0" step="50" value={metrics.waterMl} onChange={(event) => setMetrics({ ...metrics, waterMl: event.target.value })} /></label></div><button className="secondary-button journal-action" type="submit">Save metrics</button></form>

      <form className="journal-card" onSubmit={saveSleep}><div className="journal-card__heading"><MetricGlyph name="sleep" /><div><h2>Sleep</h2><p>Log your own schedule; this does not measure sleep stages.</p></div></div><div className="two-fields"><label>Bedtime<input type="time" value={sleep.bedtime} onChange={(event) => setSleep({ ...sleep, bedtime: event.target.value })} /></label><label>Wake time<input type="time" value={sleep.wakeTime} onChange={(event) => setSleep({ ...sleep, wakeTime: event.target.value })} /></label></div><label>How did you feel?<select value={sleep.feeling} onChange={(event) => setSleep({ ...sleep, feeling: event.target.value })}><option value="">Choose one</option>{feelingOptions.map((item) => <option value={item} key={item}>{item}</option>)}</select></label><div className="sleep-summary-row"><p className="sleep-inline">Duration: {sleepState.minutes ? formatMinutes(sleepState.minutes) : 'Add bedtime and wake time'}</p><span className={`sleep-status sleep-status--${sleepState.duration.label.toLowerCase()}`}>{sleepState.duration.label}</span></div><button className="secondary-button journal-action" type="submit">Save sleep</button></form>

      <form className="journal-card" onSubmit={addActivity}><div className="journal-card__heading"><MetricGlyph name="activity" /><div><h2>Add activity</h2><p>Type, duration, and your own intensity rating.</p></div></div><div className="two-fields"><label>Activity<select value={activity.type} onChange={(event) => setActivity({ ...activity, type: event.target.value })}>{activityTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Minutes<input type="number" min="1" value={activity.minutes} onChange={(event) => setActivity({ ...activity, minutes: event.target.value })} /></label></div><label>Intensity<select value={activity.intensity} onChange={(event) => setActivity({ ...activity, intensity: event.target.value })}><option>Light</option><option>Moderate</option><option>Hard</option></select></label><button className="secondary-button" type="submit">Add activity</button><ul className="entry-list">{day.activities.map((item) => <li key={item.id}><span>{item.type} · {item.minutes} min · {item.intensity}</span><button className="delete-entry" type="button" onClick={() => onRemoveEntry(date, 'activities', item.id)}>Remove</button></li>)}</ul></form>

      <form className="journal-card" onSubmit={addMeal}><div className="journal-card__heading"><MetricGlyph name="meals" /><div><h2>Meals</h2><p>Keep a simple portion and timing journal.</p></div></div><div className="two-fields"><label>Meal<select value={meal.type} onChange={(event) => setMeal({ ...meal, type: event.target.value })}>{mealTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Time<input type="time" value={meal.time} onChange={(event) => setMeal({ ...meal, time: event.target.value })} /></label></div><label>What did you eat?<input placeholder="e.g. yogurt, berries, oats" value={meal.title} onChange={(event) => setMeal({ ...meal, title: event.target.value })} /></label><label>Portion (optional)<input placeholder="e.g. 1 bowl" value={meal.portion} onChange={(event) => setMeal({ ...meal, portion: event.target.value })} /></label><button className="secondary-button" type="submit">Add meal</button><ul className="entry-list">{day.meals.map((item) => <li key={item.id}><span>{item.type}: {item.title}{item.portion ? ` · ${item.portion}` : ''}</span><button className="delete-entry" type="button" onClick={() => onRemoveEntry(date, 'meals', item.id)}>Remove</button></li>)}</ul></form>

      <section className="journal-card"><div className="journal-card__heading"><MetricGlyph name="medication" /><div><h2>Medication</h2><p>Record your own confirmation. This is not medical guidance.</p></div></div><ul className="medication-list">{medications.map((item) => <li key={item.id}><span><strong>{item.label}</strong><small>Scheduled for {item.time}</small></span><button className={day.medicationLogs[item.id] ? 'record-button record-button--done' : 'record-button'} type="button" onClick={() => onToggleMedication(date, item.id)}>{day.medicationLogs[item.id] ? 'Recorded' : 'Mark taken'}</button></li>)}</ul></section>

      <section className="journal-card"><div className="journal-card__heading"><MetricGlyph name="mood" /><div><h2>Mind</h2><p>Mood, stress, and energy are separate self-reports.</p></div></div><div className="two-fields"><label>Mood<select value={day.wellbeing.mood} onChange={(event) => onUpdateWellbeing(date, { mood: event.target.value })}><option value="">Not logged</option>{moodOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Stress (0–10)<input type="number" min="0" max="10" value={day.wellbeing.stress ?? ''} onChange={(event) => { if (!optionalNumber(event.target.value, 0, 10, (stress) => onUpdateWellbeing(date, { stress }))) event.target.value = day.wellbeing.stress ?? '' }} /></label></div><label>Energy (0–10)<input type="number" min="0" max="10" value={day.wellbeing.energy ?? ''} onChange={(event) => { if (!optionalNumber(event.target.value, 0, 10, (energy) => onUpdateWellbeing(date, { energy }))) event.target.value = day.wellbeing.energy ?? '' }} /></label></section>

      <section className="journal-card"><div className="journal-card__heading"><MetricGlyph name="cycle" /><div><h2>Cycle & symptoms</h2><p>Optional private context; it is never part of your progress score.</p></div></div><label>Cycle day<input type="number" min="1" max="366" value={day.cycle.day ?? ''} onChange={(event) => { if (!optionalNumber(event.target.value, 1, 366, (dayValue) => onUpdateCycle(date, { day: dayValue }))) event.target.value = day.cycle.day ?? '' }} /></label><form className="inline-form" onSubmit={addSymptom}><label>Symptom<input placeholder="e.g. headache" value={symptom.name} onChange={(event) => setSymptom({ ...symptom, name: event.target.value })} /></label><label>Severity<select value={symptom.severity} onChange={(event) => setSymptom({ ...symptom, severity: event.target.value })}><option>Mild</option><option>Moderate</option><option>High</option></select></label><button className="secondary-button" type="submit">Add</button></form><ul className="entry-list">{day.symptoms.map((item) => <li key={item.id}><span>{item.name} · {item.severity}</span><button className="delete-entry" type="button" onClick={() => onRemoveEntry(date, 'symptoms', item.id)}>Remove</button></li>)}</ul></section>
    </section>
  </main>
}
