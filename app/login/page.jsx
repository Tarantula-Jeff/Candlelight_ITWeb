'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Login() {
  const router = useRouter(); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  async function signIn(event) { event.preventDefault(); setBusy(true); setMessage(''); const form = new FormData(event.currentTarget); const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); const data = await response.json(); if (response.ok) { const next = new URLSearchParams(window.location.search).get('next'); router.push(next || '/admin') } else { setMessage(data.message); setBusy(false) } }
  return <main className="login-page"><section className="login-card"><a href="/">← Back to Candlelight Studio</a><p className="eyebrow green">ADMIN ACCESS</p><h1>Welcome back.</h1><p>Sign in to manage music, artwork, and Scratch games.</p><form onSubmit={signIn}><label>Email<input name="email" type="email" defaultValue="thunderfrey6@gmail.com" required /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label><button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button><p className="login-message">{message}</p></form></section></main>
}
