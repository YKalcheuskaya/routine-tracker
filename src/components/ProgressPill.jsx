export default function ProgressPill({ complete, total, label = 'steps complete' }) {
  const done = total > 0 && complete === total
  return (
    <p className={`progress-pill${done ? ' progress-pill--done' : ''}`} aria-live="polite">
      {done ? 'All done!' : `${complete} of ${total} ${label}`}
    </p>
  )
}
