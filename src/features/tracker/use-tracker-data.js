/** Connects React state to the versioned local wellness journal. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getLocalDate } from '../completion/date'
import {
  addActivityForDate, addMealForDate, addSymptomForDate, createTrackerData,
  loadTrackerData, removeEntryForDate, saveTrackerData, toggleMedicationForDate,
  updateCycleForDate, updateGoals, updateMedications, updateMetricsForDate,
  updateSleepForDate, updateWellbeingForDate,
} from './tracker-storage'
import { cloudConfigured } from '../cloud/supabase-client'
import { loadCloudSnapshot, saveCloudSnapshot } from '../cloud/cloud-storage'

function browserStorage() { try { return window.localStorage } catch { return null } }
function recordId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

export function useTrackerData(defaultRoutines, userId = null, now = () => new Date()) {
  const storage = browserStorage()
  const [localDate, setLocalDate] = useState(() => getLocalDate(now()))
  const [state, setState] = useState(() => storage ? loadTrackerData(storage, defaultRoutines) : { data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: false })
  const [cloudStatus, setCloudStatus] = useState(userId && cloudConfigured ? 'connecting' : 'local')
  const cloudReady = useRef(false)
  const dataRef = useRef(state.data)
  const previousUserId = useRef(null)

  useEffect(() => { dataRef.current = state.data }, [state.data])

  useEffect(() => {
    if (!state.migrated || !storage) return
    const available = saveTrackerData(storage, state.data)
    setState((current) => ({ ...current, migrated: false, available }))
  }, [state.data, state.migrated, storage])

  useEffect(() => {
    cloudReady.current = false
    if (!userId || !cloudConfigured) {
      if (previousUserId.current) {
        const guestData = createTrackerData(defaultRoutines)
        setState((current) => ({ ...current, data: guestData, available: storage ? saveTrackerData(storage, guestData) : false }))
      }
      previousUserId.current = null
      setCloudStatus('local')
      return undefined
    }
    let active = true
    previousUserId.current = userId
    setCloudStatus('connecting')
    async function connectAccountJournal() {
      try {
        const snapshot = await loadCloudSnapshot(userId)
        if (!active) return
        if (snapshot) {
          setState((current) => ({ ...current, data: snapshot, available: storage ? saveTrackerData(storage, snapshot) : false }))
        } else {
          const accountData = createTrackerData(defaultRoutines)
          setState((current) => ({ ...current, data: accountData, available: storage ? saveTrackerData(storage, accountData) : false }))
          await saveCloudSnapshot(userId, accountData)
        }
        if (!active) return
        cloudReady.current = true
        setCloudStatus('synced')
      } catch {
        if (active) setCloudStatus('error')
      }
    }
    connectAccountJournal()
    return () => { active = false }
  }, [defaultRoutines, storage, userId])

  useEffect(() => {
    if (!userId || !cloudConfigured || !cloudReady.current) return
    saveCloudSnapshot(userId, state.data).then(() => setCloudStatus('synced')).catch(() => setCloudStatus('error'))
  }, [state.data, userId])

  const refreshForDate = useCallback(() => setLocalDate(getLocalDate(now())), [now])
  useEffect(() => {
    const interval = window.setInterval(refreshForDate, 60_000)
    window.addEventListener('focus', refreshForDate)
    document.addEventListener('visibilitychange', refreshForDate)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refreshForDate); document.removeEventListener('visibilitychange', refreshForDate) }
  }, [refreshForDate])

  const mutate = useCallback((transform) => {
    setState((current) => {
      const data = transform(current.data)
      const available = storage ? saveTrackerData(storage, data) : false
      return { ...current, data, available }
    })
  }, [storage])

  const actions = useMemo(() => ({
    updateMetrics: (date, values) => mutate((data) => updateMetricsForDate(data, date, values)),
    updateSleep: (date, values) => mutate((data) => updateSleepForDate(data, date, values)),
    addActivity: (date, values) => mutate((data) => addActivityForDate(data, date, { ...values, id: recordId('activity') })),
    addMeal: (date, values) => mutate((data) => addMealForDate(data, date, { ...values, id: recordId('meal') })),
    removeEntry: (date, collection, id) => mutate((data) => removeEntryForDate(data, date, collection, id)),
    toggleMedication: (date, medicationId) => mutate((data) => toggleMedicationForDate(data, date, medicationId)),
    updateWellbeing: (date, values) => mutate((data) => updateWellbeingForDate(data, date, values)),
    updateCycle: (date, values) => mutate((data) => updateCycleForDate(data, date, values)),
    addSymptom: (date, values) => mutate((data) => addSymptomForDate(data, date, { ...values, id: recordId('symptom') })),
    saveGoals: (values) => mutate((data) => updateGoals(data, values)),
    saveMedications: (values) => mutate((data) => updateMedications(data, values)),
    importData: (data) => mutate(() => data),
  }), [mutate])

  const day = state.data.days[localDate]
  return useMemo(() => ({
    data: state.data,
    days: state.data.days,
    goals: state.data.goals,
    medications: state.data.medications,
    localDate,
    day,
    recovered: state.recovered,
    available: state.available,
    cloudStatus,
    refreshForDate,
    ...actions,
  }), [actions, cloudStatus, day, localDate, refreshForDate, state])
}
