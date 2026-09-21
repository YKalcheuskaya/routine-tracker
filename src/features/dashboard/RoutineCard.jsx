/**
 * Interactive Today card. Stable routine-and-step identifiers connect each
 * checkbox to persisted completion without using editable display text as a key.
 */
import { categoryMeta } from '../../data/routines'
import ProgressPill from '../../components/ProgressPill'

export default function RoutineCard({ routine, completedStepIds, onToggle }) {
  const meta = categoryMeta[routine.category]
  const completed = routine.steps.filter((step) => completedStepIds.includes(`${routine.id}:${step.id}`)).length
  return (
    <article className={`routine-card routine-card--${routine.category}`}>
      <div className="routine-card__header">
        <div>
          <p className="eyebrow"><span aria-hidden="true">{meta.icon}</span> {meta.label}</p>
          <h3>{routine.title}</h3>
          <p className="routine-card__description">{routine.description}</p>
        </div>
        <ProgressPill complete={completed} total={routine.steps.length} />
      </div>
      <ul className="step-list">
        {routine.steps.map((step) => {
          const id = `${routine.id}:${step.id}`
          const isComplete = completedStepIds.includes(id)
          return (
            <li key={step.id} className={isComplete ? 'step step--complete' : 'step'}>
              <label>
                <input type="checkbox" checked={isComplete} onChange={() => onToggle(id)} aria-label={`Complete: ${step.title}`} />
                <span className="step__copy"><strong>{step.title}</strong>{step.detail && <small>{step.detail}</small>}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
