import RoutineCard from './RoutineCard'

export default function PeriodSection({ title, routines, completedStepIds, onToggle }) {
  return (
    <section className="period-section" aria-labelledby={`${title.toLowerCase()}-heading`}>
      <div className="period-section__heading"><p className="eyebrow">{title}</p><h2 id={`${title.toLowerCase()}-heading`}>{title === 'AM' ? 'Start gently' : 'Wind down kindly'}</h2></div>
      {routines.length === 0 ? <div className="empty-state">No routines are planned for this part of the day yet.</div> : (
        <div className="routine-grid">{routines.map((routine) => <RoutineCard key={routine.id} routine={routine} completedStepIds={completedStepIds} onToggle={onToggle} />)}</div>
      )}
    </section>
  )
}
