/** Directly verifies the tracked RLS policies with two disposable local users. */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const values = Object.fromEntries(
  readFileSync('.env.local', 'utf8').trim().split('\n').map((line) => {
    const separator = line.indexOf('=')
    return [line.slice(0, separator), line.slice(separator + 1)]
  }),
)

const url = values.VITE_SUPABASE_URL
const publishableKey = values.VITE_SUPABASE_PUBLISHABLE_KEY
if (!url || !publishableKey) throw new Error('Local browser configuration is missing. Run npm run supabase:env first.')

const client = () => createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
const accountA = client()
const accountB = client()
const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`

async function createAccount(api, label) {
  const { data, error } = await api.auth.signUp({ email: `rls-${label}-${stamp}@example.test`, password: 'Fictional-rls-password-2026' })
  if (error || !data.user) throw new Error(`Could not create disposable account ${label}.`)
  return data.user.id
}

let ownerId
try {
  ownerId = await createAccount(accountA, 'owner')
  await createAccount(accountB, 'other')

  const ownerInsert = await accountA.from('wellness_snapshots').insert({ user_id: ownerId, journal: { fictionalValue: 1250 } })
  const crossSelect = await accountB.from('wellness_snapshots').select().eq('user_id', ownerId)
  const crossInsert = await accountB.from('wellness_snapshots').insert({ user_id: ownerId, journal: { fictionalValue: 0 } })
  const crossUpdate = await accountB.from('wellness_snapshots').update({ journal: { fictionalValue: 0 } }).eq('user_id', ownerId).select()
  const crossDelete = await accountB.from('wellness_snapshots').delete().eq('user_id', ownerId).select()
  const ownerRead = await accountA.from('wellness_snapshots').select('journal').eq('user_id', ownerId).single()

  const checks = {
    ownerInsert: !ownerInsert.error,
    crossSelectBlocked: !crossSelect.error && crossSelect.data.length === 0,
    crossInsertBlocked: crossInsert.error?.code === '42501',
    crossUpdateBlocked: !crossUpdate.error && crossUpdate.data.length === 0,
    crossDeleteBlocked: !crossDelete.error && crossDelete.data.length === 0,
    ownerRecordUnchanged: ownerRead.data?.journal.fictionalValue === 1250,
  }
  const failed = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name)
  if (failed.length) throw new Error(`RLS verification failed: ${failed.join(', ')}.`)
  console.log('RLS verification passed: owner access works and cross-account select, insert, update, and delete are blocked.')
} finally {
  if (ownerId) await accountA.from('wellness_snapshots').delete().eq('user_id', ownerId)
  await accountA.auth.signOut()
  await accountB.auth.signOut()
}
