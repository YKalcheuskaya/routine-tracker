import { createClient } from '@supabase/supabase-js'

const guestPreview = import.meta.env.VITE_GUEST_PREVIEW === 'true'
const url = guestPreview ? '' : import.meta.env.VITE_SUPABASE_URL
const publishableKey = guestPreview ? '' : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const cloudConfigured = Boolean(url && publishableKey)
export const supabase = cloudConfigured ? createClient(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null
