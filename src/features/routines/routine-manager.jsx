import { useState } from 'react'
import { categoryMeta } from '../../data/routines'
import { routineFromDraft } from './routine-model'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const blankDraft = () => ({ id: '', title: '', description: '', category: 'care', period: 'am', weekdays: ['monday'], steps: [{ id: '', title: '', detail: '' }] })
const draftFromRoutine = (routine) => ({ ...routine, weekdays: [...routine.weekdays], steps: routine.steps.map((step) => ({ ...step, detail: step.detail ?? '' })) })

function move(items, index, offset) {
  const nextIndex = index + offset
  if (nextIndex < 0 || nextIndex >= items.length) return items
  const next = [...items]
  ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
  return next
}

export default function RoutineManager({ routines, onSave, onDelete, onRestore }) {
  const [draft, setDraft] = useState(blankDraft)
  const [errors, setErrors] = useState([])
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingRestore, setPendingRestore] = useState(false)
  const [showForm, setShowForm] = useState(false)

  function startNew() { setDraft(blankDraft()); setErrors([]); setShowForm(true) }
  function startEdit(routine) { setDraft(draftFromRoutine(routine)); setErrors([]); setShowForm(true) }
  function updateStep(index, field, value) { setDraft((current) => ({ ...current, steps: current.steps.map((step, stepIndex) => stepIndex === index ? { ...step, [field]: value } : step) })) }

  function submit(event) {
    event.preventDefault()
    const result = routineFromDraft(draft, routines)
    if (result.errors.length > 0) { setErrors(result.errors); return }
    onSave(result.routine)
    setShowForm(false)
    setDraft(blankDraft())
    setErrors([])
  }

  function confirmDelete() {
    onDelete(pendingDelete.id)
    if (draft.id === pendingDelete.id) setShowForm(false)
    setPendingDelete(null)
  }

  return (
    <main className="page-content" id="main-content">
      <section className="manager-header"><div><p className="eyebrow">Routines</p><h1>Shape your weekly rhythm.</h1><p>Create a routine once, choose when it appears, and keep Today focused on the next small step.</p></div><button className="primary-button" type="button" onClick={startNew}>Add routine</button></section>
      {showForm && <form className="routine-form" onSubmit={submit} noValidate>
        <div className="form-heading"><div><p className="eyebrow">{draft.id ? 'Edit routine' : 'New routine'}</p><h2>{draft.id ? draft.title : 'Build a routine'}</h2></div><button className="text-button" type="button" onClick={() => setShowForm(false)}>Close</button></div>
        {errors.length > 0 && <div className="form-errors" role="alert"><strong>Please review:</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        <div className="form-grid"><label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label>Description<input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{Object.entries(categoryMeta).map(([value, meta]) => <option value={value} key={value}>{meta.label}</option>)}</select></label><label>Time of day<select value={draft.period} onChange={(event) => setDraft({ ...draft, period: event.target.value })}><option value="am">Morning</option><option value="pm">Evening</option></select></label></div>
        <fieldset><legend>Weekdays</legend><div className="weekday-options">{days.map((day) => <label key={day}><input type="checkbox" checked={draft.weekdays.includes(day)} onChange={() => setDraft((current) => ({ ...current, weekdays: current.weekdays.includes(day) ? current.weekdays.filter((item) => item !== day) : [...current.weekdays, day] }))} />{day.slice(0, 3)}</label>)}</div></fieldset>
        <fieldset><legend>Steps</legend><div className="step-editor">{draft.steps.map((step, index) => <div className="step-editor__row" key={`${step.id || 'new'}-${index}`}><label>Step {index + 1}<input value={step.title} onChange={(event) => updateStep(index, 'title', event.target.value)} /></label><label>Optional detail<input value={step.detail} onChange={(event) => updateStep(index, 'detail', event.target.value)} /></label><div className="step-actions"><button type="button" className="icon-button" aria-label={`Move step ${index + 1} up`} disabled={index === 0} onClick={() => setDraft({ ...draft, steps: move(draft.steps, index, -1) })}>↑</button><button type="button" className="icon-button" aria-label={`Move step ${index + 1} down`} disabled={index === draft.steps.length - 1} onClick={() => setDraft({ ...draft, steps: move(draft.steps, index, 1) })}>↓</button><button type="button" className="text-button text-button--danger" disabled={draft.steps.length === 1} onClick={() => setDraft({ ...draft, steps: draft.steps.filter((_, stepIndex) => stepIndex !== index) })}>Remove</button></div></div>)}</div><button type="button" className="secondary-button" onClick={() => setDraft({ ...draft, steps: [...draft.steps, { id: '', title: '', detail: '' }] })}>Add step</button></fieldset>
        <div className="form-actions"><button className="primary-button" type="submit">{draft.id ? 'Save changes' : 'Create routine'}</button><button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
      </form>}
      <section aria-labelledby="routine-library-heading"><div className="section-heading"><div><p className="eyebrow">Library</p><h2 id="routine-library-heading">{routines.length} routines</h2></div><button className="text-button" type="button" onClick={() => setPendingRestore(true)}>Restore demo routines</button></div>{routines.length === 0 ? <p className="empty-state">No routines yet. Add one to build your week.</p> : <div className="manager-grid">{routines.map((routine) => <article className={`manager-card routine-card--${routine.category}`} key={routine.id}><p className="eyebrow"><span aria-hidden="true">{categoryMeta[routine.category].icon}</span> {categoryMeta[routine.category].label} · {routine.period.toUpperCase()}</p><h3>{routine.title}</h3><p>{routine.description}</p><p className="manager-card__meta">{routine.weekdays.length === 7 ? 'Every day' : routine.weekdays.map((day) => day.slice(0, 3)).join(', ')} · {routine.steps.length} {routine.steps.length === 1 ? 'step' : 'steps'}</p><div className="card-actions"><button className="secondary-button" type="button" onClick={() => startEdit(routine)}>Edit</button><button className="text-button text-button--danger" type="button" onClick={() => setPendingDelete(routine)}>Delete</button></div></article>)}</div>}</section>
      {pendingDelete && <div className="confirmation" role="alertdialog" aria-modal="true" aria-labelledby="delete-heading"><div className="confirmation__card"><p className="eyebrow">Confirm deletion</p><h2 id="delete-heading">Delete “{pendingDelete.title}”?</h2><p>It will stop appearing in Today and Schedule. Existing history snapshots will remain available.</p><div className="form-actions"><button className="danger-button" type="button" onClick={confirmDelete}>Delete routine</button><button className="secondary-button" type="button" onClick={() => setPendingDelete(null)}>Keep routine</button></div></div></div>}
      {pendingRestore && <div className="confirmation" role="alertdialog" aria-modal="true" aria-labelledby="restore-heading"><div className="confirmation__card"><p className="eyebrow">Confirm restore</p><h2 id="restore-heading">Restore the demo routine library?</h2><p>This replaces the current routine library. Existing history snapshots will remain available.</p><div className="form-actions"><button className="danger-button" type="button" onClick={() => { onRestore(); setPendingRestore(false) }}>Restore demo routines</button><button className="secondary-button" type="button" onClick={() => setPendingRestore(false)}>Keep my routines</button></div></div></div>}
    </main>
  )
}
