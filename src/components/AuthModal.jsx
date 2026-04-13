import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast, useLang } from '../App'

export default function AuthModal({ onClose }) {
  const showToast = useToast()
  const { t } = useLang()
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) { setError(t('auth.required')); return }
    setLoading(true); setError('')
    let result
    if (tab === 'signin') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: 'https://app.saknes.org/' }
      })
    }
    setLoading(false)
    if (result.error) { setError(result.error.message); return }
    if (tab === 'signup') {
      setError('')
      showToast(t('auth.checkEmail'), 'success')
      setTab('signin')
      return
    }
    showToast(t('auth.signedIn'), 'success')
    onClose()
  }

  return (
    <div className="modal-backdrop auth-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <div>
            <div className="modal-hdr-title">{t('auth.title')}</div>
            <div className="modal-hdr-sub">{t('auth.subtitle')}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); setError('') }}>{t('auth.tabSignin')}</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>{t('auth.tabRegister')}</button>
        </div>

        <div className="modal-bdy">
          <div className="auth-field">
            <label className="auth-label">{t('auth.email')}</label>
            <input className="auth-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">{t('auth.password')}</label>
            <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {tab === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">{t('auth.name')}</label>
              <input className="auth-input" type="text" placeholder={t('auth.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="auth-error">{error}</div>
        </div>

        <div className="modal-ftr">
          <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
            {loading ? t('auth.wait') : tab === 'signin' ? t('auth.signinBtn') : t('auth.registerBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}
