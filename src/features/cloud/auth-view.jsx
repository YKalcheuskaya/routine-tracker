import { useState } from 'react'

export default function AuthView({ auth }) {
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    await (mode === 'sign-in' ? auth.signIn(email, password) : auth.signUp(email, password))
    setBusy(false)
  }

  if (!auth.configured) return <main className="page-content auth-page" id="main-content"><section className="auth-card"><p className="eyebrow">Cloud account</p><h1>Accounts are ready to connect.</h1><p>This local build stays private until its Supabase environment is configured. The published app will offer sign-up, sign-in, and personal cloud sync.</p><p className="notice">No account details are collected in this preview.</p></section></main>
  if (auth.loading) return <main className="page-content auth-page" id="main-content"><section className="auth-card"><p className="eyebrow">Cloud account</p><h1>Checking your session…</h1></section></main>
  if (auth.session) return <main className="page-content auth-page" id="main-content"><section className="auth-card"><p className="eyebrow">Signed in</p><h1>Your wellness journal is private.</h1><p>{auth.session.user.email}</p><p>Cloud sync is limited to your account. This app does not provide medical guidance or share journal entries with other users.</p><button className="primary-button" type="button" onClick={auth.signOut}>Sign out</button></section></main>
  return <main className="page-content auth-page" id="main-content"><section className="auth-card"><p className="eyebrow">Cloud account</p><h1>{mode === 'sign-in' ? 'Welcome back.' : 'Create your account.'}</h1><p>Each account has a private wellness journal. Use an email address and a strong password.</p><form onSubmit={submit}><label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{auth.error && <p className="form-errors" role="alert">{auth.error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button></form><button className="text-button" type="button" onClick={() => setMode((value) => value === 'sign-in' ? 'sign-up' : 'sign-in')}>{mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button></section></main>
}
