import { normalizeData } from '../tracker/tracker-storage'
import { supabase } from './supabase-client'

const table = 'wellness_snapshots'

export async function loadCloudSnapshot(userId) {
  const { data, error } = await supabase.from(table).select('journal').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data?.journal ? normalizeData(data.journal) : null
}

export async function saveCloudSnapshot(userId, journal) {
  const { error } = await supabase.from(table).upsert({ user_id: userId, journal: normalizeData(journal) }, { onConflict: 'user_id' })
  if (error) throw error
}
