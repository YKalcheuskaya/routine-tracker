import { useEffect, useState } from 'react'
import { cloudConfigured, supabase } from './supabase-client'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(cloudConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!cloudConfigured) return undefined
    let active = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      setSession(data.session ?? null)
      setError(sessionError?.message ?? '')
      setLoading(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => { active = false; subscription.subscription.unsubscribe() }
  }, [])

  async function signIn(email, password) {
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) setError(signInError.message)
    return !signInError
  }

  async function signUp(email, password) {
    setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) setError(signUpError.message)
    if (!signUpError && !data.session) setError('Check your email to confirm your account, then sign in.')
    return !signUpError
  }

  async function signOut() {
    setError('')
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) setError(signOutError.message)
  }

  return { configured: cloudConfigured, session, loading, error, signIn, signUp, signOut }
}
