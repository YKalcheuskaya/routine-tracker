const glyphs = {
  activity: '↗', sleep: '◔', hydration: '◌', meals: '✦', medication: '＋',
  mood: '◡', cycle: '◒', symptoms: '⌁', calendar: '□', insights: '▥', plans: '⚙',
}

export default function MetricGlyph({ name }) {
  return <span className={`metric-glyph metric-glyph--${name}`} aria-hidden="true">{glyphs[name] ?? '•'}</span>
}
