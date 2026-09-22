/** User-owned goal and reminder configuration. No defaults are medical prescriptions. */
import { useEffect, useState } from 'react'
import MetricGlyph from '../../components/MetricGlyph'

const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const blankMedication = () => ({ id: '', label: '', time: '08:00', weekdays: allDays })

export default function PlansView({ goals, medications, onSaveGoals, onSaveMedications }) {
  const [goalDraft, setGoalDraft] = useState(goals)
  const [medicationDraft, setMedicationDraft] = useState(medications)
  useEffect(() => setGoalDraft(goals), [goals])
  useEffect(() => setMedicationDraft(medications), [medications])

  function saveGoals(event) { event.preventDefault(); onSaveGoals({ ...goalDraft, steps: Number(goalDraft.steps), waterMl: Number(goalDraft.waterMl), sleepMinutes: Number(goalDraft.sleepMinutes), bedtimeWindowMinutes: Number(goalDraft.bedtimeWindowMinutes), meals: Number(goalDraft.meals), activityMinutes: Number(goalDraft.activityMinutes) }) }
  function addMedication() { setMedicationDraft((items) => [...items, { ...blankMedication(), id: `medication-${Date.now()}` }]) }

  return <main className="page-content plans-page" id="main-content">
    <section className="plans-heading"><p className="eyebrow">Your settings</p><h1>Plans</h1><p>Define what progress means to you. These goals are editable personal preferences, not medical prescriptions.</p></section>
    <form className="plans-card" onSubmit={saveGoals}><div className="journal-card__heading"><MetricGlyph name="plans" /><div><h2>Daily goals</h2><p>Used only for your Daily Progress calculation.</p></div></div><div className="goal-form"><label>Steps<input type="number" min="1" value={goalDraft.steps} onChange={(event) => setGoalDraft({ ...goalDraft, steps: event.target.value })} /></label><label>Water (ml)<input type="number" min="1" step="50" value={goalDraft.waterMl} onChange={(event) => setGoalDraft({ ...goalDraft, waterMl: event.target.value })} /></label><label>Sleep duration (minutes)<input type="number" min="1" value={goalDraft.sleepMinutes} onChange={(event) => setGoalDraft({ ...goalDraft, sleepMinutes: event.target.value })} /></label><label>Bedtime target<input type="time" value={goalDraft.bedtime} onChange={(event) => setGoalDraft({ ...goalDraft, bedtime: event.target.value })} /></label><label>Bedtime window (minutes)<input type="number" min="0" value={goalDraft.bedtimeWindowMinutes} onChange={(event) => setGoalDraft({ ...goalDraft, bedtimeWindowMinutes: event.target.value })} /></label><label>Meals to log<input type="number" min="1" value={goalDraft.meals} onChange={(event) => setGoalDraft({ ...goalDraft, meals: event.target.value })} /></label></div><button className="primary-button" type="submit">Save goals</button></form>
    <section className="plans-card"><div className="journal-card__heading"><MetricGlyph name="medication" /><div><h2>Medication reminders</h2><p>Labels and schedules are created by you; the app does not give medication advice.</p></div></div><div className="medication-settings">{medicationDraft.map((item, index) => <div className="medication-edit" key={item.id}><label>Label<input value={item.label} onChange={(event) => setMedicationDraft((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, label: event.target.value } : entry))} /></label><label>Time<input type="time" value={item.time} onChange={(event) => setMedicationDraft((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, time: event.target.value } : entry))} /></label><button className="delete-entry" type="button" onClick={() => setMedicationDraft((items) => items.filter((_, entryIndex) => entryIndex !== index))}>Remove</button></div>)}</div><div className="form-actions"><button className="secondary-button" type="button" onClick={addMedication}>Add reminder</button><button className="primary-button" type="button" onClick={() => onSaveMedications(medicationDraft.filter((item) => item.label.trim()))}>Save reminders</button></div></section>
  </main>
}
