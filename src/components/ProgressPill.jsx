/**
 * Shared progress summary used by both the daily dashboard and individual cards.
 * The live region announces changes to assistive technology after a step is toggled.
 */
export default function ProgressPill({ complete, total, label = 'steps complete' }) {
  const done = total > 0 && complete === total
  return (
    <p className={`progress-pill${done ? ' progress-pill--done' : ''}`} aria-live="polite">
      {done ? 'All done!' : `${complete} of ${total} ${label}`}
    </p>
  )
}
