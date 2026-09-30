/** Connects React state to the versioned local wellness journal. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getLocalDate } from '../completion/date'
import {
  addActivityForDate, addMealForDate, addSymptomForDate, createTrackerData,
  loadTrackerData, removeEntryForDate, saveTrackerData, storageKeyForAccount, toggleMedicationForDate,
  updateCycleForDate, updateGoals, updateMedications, updateMetricsForDate,
  updateSleepForDate, updateWellbeingForDate,
} from './tracker-storage'
import { cloudConfigured } from '../cloud/supabase-client'
import { loadCloudSnapshot, saveCloudSnapshot } from '../cloud/cloud-storage'

function browserStorage() { try { return window.localStorage } catch { return null } }
function recordId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

export function useTrackerData(defaultRoutines, { userId = null, authLoading = false } = {}, now = () => new Date()) {
  const storage = browserStorage()
  const [localDate, setLocalDate] = useState(() => getLocalDate(now()))
  const [state, setState] = useState(() => ({ data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: Boolean(storage), revision: 0 }))
  const [cloudStatus, setCloudStatus] = useState('local')
  const [owner, setOwner] = useState(null)
  const [ready, setReady] = useState(false)
  const generation = useRef(0)
  const sync = useRef(null)

  useEffect(() => {
    const currentGeneration = ++generation.current
    const context = { generation: currentGeneration, owner: userId, writable: false, queue: Promise.resolve(), lastQueuedRevision: 0, latestRevision: 0 }
    sync.current = context
    setReady(false)
    setOwner(null)
    if (cloudConfigured && authLoading) {
      setCloudStatus('connecting')
      return undefined
    }
    if (!userId || !cloudConfigured) {
      let guest = storage ? loadTrackerData(storage, defaultRoutines) : { data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: false }
      if (guest.migrated && storage) {
        guest = { ...guest, migrated: false, available: saveTrackerData(storage, guest.data) }
      }
      if (currentGeneration !== generation.current) return undefined
      setState({ ...guest, revision: 0 })
      setOwner('guest')
      setReady(true)
      setCloudStatus('local')
      return undefined
    }
    let active = true
    setCloudStatus('connecting')
    async function connectAccountJournal() {
      try {
        let snapshot
        try {
          snapshot = await loadCloudSnapshot(userId)
        } catch (error) {
          if (error?.code !== 'PGRST303') throw error
          await new Promise((resolve) => window.setTimeout(resolve, 1000))
          if (!active || currentGeneration !== generation.current) throw error
          snapshot = await loadCloudSnapshot(userId)
        }
        if (!active || currentGeneration !== generation.current) return
        let next
        if (snapshot) {
          next = { data: snapshot, recovered: false, migrated: false, available: storage ? saveTrackerData(storage, snapshot, storageKeyForAccount(userId)) : false }
        } else {
          const accountKey = storageKeyForAccount(userId)
          const hasAccountCache = Boolean(storage?.getItem(accountKey))
          const cached = hasAccountCache ? loadTrackerData(storage, defaultRoutines, accountKey) : null
          const accountData = cached && !cached.recovered ? cached.data : createTrackerData(defaultRoutines)
          next = { data: accountData, recovered: false, migrated: false, available: storage ? saveTrackerData(storage, accountData, storageKeyForAccount(userId)) : false }
          await saveCloudSnapshot(userId, accountData)
        }
        if (!active || currentGeneration !== generation.current) return
        context.writable = true
        setState({ ...next, revision: 0 })
        setOwner(userId)
        setReady(true)
        setCloudStatus('synced')
      } catch {
        if (!active || currentGeneration !== generation.current) return
        let cached = storage ? loadTrackerData(storage, defaultRoutines, storageKeyForAccount(userId)) : { data: createTrackerData(defaultRoutines), recovered: false, migrated: false, available: false }
        if (cached.migrated && storage) {
          cached = { ...cached, migrated: false, available: saveTrackerData(storage, cached.data, storageKeyForAccount(userId)) }
        }
        setState({ ...cached, revision: 0 })
        setOwner(userId)
        setReady(true)
        setCloudStatus('error')
      }
    }
    connectAccountJournal()
    return () => { active = false }
  }, [authLoading, defaultRoutines, storage, userId])

  useEffect(() => {
    const context = sync.current
    if (!userId || !cloudConfigured || !ready || owner !== userId || !context?.writable || context.owner !== userId || context.generation !== generation.current || state.revision === 0 || state.revision <= context.lastQueuedRevision) return
    const revision = state.revision
    const snapshot = state.data
    context.lastQueuedRevision = revision
    context.latestRevision = revision
    setCloudStatus('saving')
    context.queue = context.queue.catch(() => undefined).then(() => saveCloudSnapshot(userId, snapshot))
    context.queue.then(() => {
      if (sync.current === context && context.latestRevision === revision) setCloudStatus('synced')
    }).catch(() => {
      if (sync.current === context && context.latestRevision === revision) setCloudStatus('error')
    })
  }, [owner, ready, state.data, state.revision, userId])

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
      if (data === current.data) return current
      const storageKey = userId ? storageKeyForAccount(userId) : undefined
      const available = storage ? saveTrackerData(storage, data, storageKey) : false
      return { ...current, data, available, revision: current.revision + 1 }
    })
  }, [storage, userId])

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
    owner,
    ready,
    refreshForDate,
    ...actions,
  }), [actions, cloudStatus, day, localDate, owner, ready, refreshForDate, state])
}
