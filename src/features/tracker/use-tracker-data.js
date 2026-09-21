/**
 * React state adapter for the pure tracker-storage module. It exposes one shared
 * state-and-actions API to the application, persists every accepted mutation, and
 * refreshes the local date when time or browser visibility changes.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalDate } from '../completion/date'
import { createTrackerData, loadTrackerData, saveTrackerData, toggleStepForDate } from './tracker-storage'

function browserStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function useTrackerData(defaultRoutines, now = () => new Date()) {
  const storage = browserStorage()
  const [localDate, setLocalDate] = useState(() => getLocalDate(now()))
  const [state, setState] = useState(() => storage ? loadTrackerData(storage, defaultRoutines) : {
    data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: false,
  })

  useEffect(() => {
    // A migrated record is written back once so later launches use only V2.
    if (!state.migrated || !storage) return
    const available = saveTrackerData(storage, state.data)
    setState((current) => ({ ...current, migrated: false, available }))
  }, [state.data, state.migrated, storage])

  const refreshForDate = useCallback(() => setLocalDate(getLocalDate(now())), [now])

  useEffect(() => {
    // Focus and visibility checks cover sleeping/background tabs; the interval
    // covers an open tab that remains active across local midnight.
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
      const data = toggleStepForDate(current.data, localDate, stepId)
      const available = storage ? saveTrackerData(storage, data) : false
      return { ...current, data, available }
    })
  }, [localDate, storage])

  const saveRoutine = useCallback((routine) => {
    setState((current) => {
      const exists = current.data.routines.some((item) => item.id === routine.id)
      const routines = exists ? current.data.routines.map((item) => item.id === routine.id ? routine : item) : [...current.data.routines, routine]
      const data = { ...current.data, routines }
      const available = storage ? saveTrackerData(storage, data) : false
      return { ...current, data, available }
    })
  }, [storage])

  const deleteRoutine = useCallback((routineId) => {
    setState((current) => {
      const data = { ...current.data, routines: current.data.routines.filter((routine) => routine.id !== routineId) }
      const available = storage ? saveTrackerData(storage, data) : false
      return { ...current, data, available }
    })
  }, [storage])

  const restoreDemoRoutines = useCallback(() => {
    setState((current) => {
      const data = { ...current.data, routines: createTrackerData(defaultRoutines).routines }
      const available = storage ? saveTrackerData(storage, data) : false
      return { ...current, data, available }
    })
  }, [defaultRoutines, storage])

  const importData = useCallback((data) => {
    setState((current) => {
      const available = storage ? saveTrackerData(storage, data) : false
      return { ...current, data, recovered: false, migrated: false, available }
    })
  }, [storage])

  const completedStepIds = useMemo(
    () => state.data.days[localDate]?.completedStepIds ?? [],
    [localDate, state.data.days],
  )

  return useMemo(() => ({
    routines: state.data.routines,
    data: state.data,
    days: state.data.days,
    localDate,
    completedStepIds,
    recovered: state.recovered,
    available: state.available,
    toggle,
    saveRoutine,
    deleteRoutine,
    restoreDemoRoutines,
    importData,
    refreshForDate,
  }), [completedStepIds, deleteRoutine, importData, localDate, refreshForDate, restoreDemoRoutines, saveRoutine, state, toggle])
}
