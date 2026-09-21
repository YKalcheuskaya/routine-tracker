const idPattern = /[^a-z0-9]+/g

function slug(value, fallback) {
  const normalized = value.trim().toLowerCase().replace(idPattern, '-').replace(/^-|-$/g, '')
  return normalized || fallback
}

function uniqueId(base, usedIds) {
  let candidate = base
  let suffix = 2
  while (usedIds.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  return candidate
}

export function routineFromDraft(draft, routines) {
  const errors = []
  const title = draft.title.trim()
  const description = draft.description.trim()
  const weekdays = [...new Set(draft.weekdays)]
  const steps = draft.steps.map((step) => ({ ...step, title: step.title.trim(), detail: step.detail.trim() }))

  if (!title) errors.push('Add a routine title.')
  if (!description) errors.push('Add a short description.')
  if (weekdays.length === 0) errors.push('Choose at least one weekday.')
  if (steps.length === 0 || steps.some((step) => !step.title)) errors.push('Every routine needs at least one named step.')

  const normalizedTitles = steps.filter((step) => step.title).map((step) => step.title.toLowerCase())
  if (new Set(normalizedTitles).size !== normalizedTitles.length) errors.push('Step names must be unique within a routine.')
  if (errors.length > 0) return { errors, routine: null }

  const otherRoutineIds = new Set(routines.filter((routine) => routine.id !== draft.id).map((routine) => routine.id))
  const routineId = draft.id || uniqueId(slug(title, 'routine'), otherRoutineIds)
  const usedStepIds = new Set()
  const normalizedSteps = steps.map((step) => {
    const base = step.id || slug(step.title, 'step')
    const id = uniqueId(base, usedStepIds)
    usedStepIds.add(id)
    return { id, title: step.title, ...(step.detail ? { detail: step.detail } : {}) }
  })

  return { errors: [], routine: { id: routineId, category: draft.category, period: draft.period, weekdays, title, description, steps: normalizedSteps } }
}
