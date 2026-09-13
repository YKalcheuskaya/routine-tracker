export const STORAGE_KEY = 'routine-tracker:daily-progress'
export const STORAGE_VERSION = 1

export function emptyProgress(localDate) {
  return { version: STORAGE_VERSION, localDate, completedStepIds: [] }
}

function isValidProgress(value) {
  return value
    && value.version === STORAGE_VERSION
    && typeof value.localDate === 'string'
    && Array.isArray(value.completedStepIds)
    && value.completedStepIds.every((id) => typeof id === 'string')
}

export function loadProgress(storage, localDate) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return { progress: emptyProgress(localDate), recovered: false, available: true }
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { progress: emptyProgress(localDate), recovered: true, available: true }
    }
    if (!isValidProgress(parsed)) return { progress: emptyProgress(localDate), recovered: true, available: true }
    if (parsed.localDate !== localDate) return { progress: emptyProgress(localDate), recovered: false, available: true }
    return { progress: { ...parsed, completedStepIds: [...new Set(parsed.completedStepIds)] }, recovered: false, available: true }
  } catch {
    return { progress: emptyProgress(localDate), recovered: false, available: false }
  }
}

export function saveProgress(storage, progress) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}
