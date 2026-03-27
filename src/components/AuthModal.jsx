import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../App'

export default function AuthModal({ onClose }) {
  const showToast = useToast()
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')
    let result
    if (tab === 'signin') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: 'https://app.saknes.org' }
      })
    }
    setLoading(false)
    if (result.error) { setError(result.error.message); return }
    if (tab === 'signup') {
      setError('')
      showToast('Check your email to confirm your account, then sign in.', 'success')
      setTab('signin')
      return
    }
    showToast('✓ Signed in', 'success')
    onClose()
  }

  return (
    <div className="modal-backdrop auth-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <div>
            <div className="modal-hdr-title">Welcome to Saknes</div>
            <div className="modal-hdr-sub">Sign in to add and manage your family properties</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); setError('') }}>Sign In</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>Register</button>
        </div>

        <div className="modal-bdy">
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input className="auth-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {tab === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Your Name (optional)</label>
              <input className="auth-input" type="text" placeholder="How you'd like to be known" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="auth-error">{error}</div>
        </div>

        <div className="modal-ftr">
          <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
