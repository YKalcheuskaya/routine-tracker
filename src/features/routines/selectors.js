/** Pure read helpers shared by Today and Schedule views. */
export function routinesFor(routines, weekday, period) {
  return routines.filter((routine) => routine.period === period && routine.weekdays.includes(weekday))
}

export function progressFor(routines, completedStepIds) {
  const allStepIds = routines.flatMap((routine) => routine.steps.map((step) => `${routine.id}:${step.id}`))
  const complete = allStepIds.filter((id) => completedStepIds.includes(id)).length
  return { complete, total: allStepIds.length }
}
