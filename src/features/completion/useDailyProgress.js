import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalDate } from './date'
import { emptyProgress, loadProgress, saveProgress } from './storage'

function browserStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function useDailyProgress(now = () => new Date()) {
  const storage = browserStorage()
  const initialDate = getLocalDate(now())
  const [state, setState] = useState(() => storage ? loadProgress(storage, initialDate) : {
    progress: emptyProgress(initialDate), recovered: false, available: false,
  })

  const refreshForDate = useCallback(() => {
    const localDate = getLocalDate(now())
    setState((current) => {
      if (current.progress.localDate === localDate) return current
      return storage ? loadProgress(storage, localDate) : {
        progress: emptyProgress(localDate), recovered: false, available: false,
      }
    })
  }, [now, storage])

  useEffect(() => {
    const interval = window.setInterval(refreshForDate, 60_000)
    window.addEventListener('focus', refreshForDate)
    document.addEventListener('visibilitychange', refreshForDate)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshForDate)
      document.removeEventListener('visibilitychange', refreshForDate)
    }
  }, [refreshForDate])

  const toggle = useCallback((stepId) => {
    setState((current) => {
      const completed = new Set(current.progress.completedStepIds)
      completed.has(stepId) ? completed.delete(stepId) : completed.add(stepId)
      const progress = { ...current.progress, completedStepIds: [...completed] }
      const available = storage ? saveProgress(storage, progress) : false
      return { ...current, progress, available }
    })
  }, [storage])

  return useMemo(() => ({ ...state.progress, recovered: state.recovered, available: state.available, toggle, refreshForDate }), [state, toggle, refreshForDate])
}
