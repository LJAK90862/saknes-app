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
    if (!email || !password) { setError('L\u016bdzu ievadiet e-pastu un paroli.'); return }
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
      showToast('P\u0101rbaudiet e-pastu, lai apstiprin\u0101tu kontu, tad ielogoties.', 'success')
      setTab('signin')
      return
    }
    showToast('\u2713 Ielogoj\u0101ties', 'success')
    onClose()
  }

  return (
    <div className="modal-backdrop auth-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <div>
            <div className="modal-hdr-title">Laipni l&#363;gti Saknes</div>
            <div className="modal-hdr-sub">Ielogoties, lai pievienotu un p&#257;rvald&#299;tu savus &#291;imenes &#299;pa&#353;umus</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); setError('') }}>Ielogoties</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>Re&#291;istr&#275;ties</button>
        </div>

        <div className="modal-bdy">
          <div className="auth-field">
            <label className="auth-label">E-pasta adrese</label>
            <input className="auth-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Parole</label>
            <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {tab === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">J&#363;su v&#257;rds (neoblig&#257;ti)</label>
              <input className="auth-input" type="text" placeholder="K&#257; v&#275;laties b&#363;t paz&#299;stams" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="auth-error">{error}</div>
        </div>

        <div className="modal-ftr">
          <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
            {loading ? 'L\u016bdzu gaidiet...' : tab === 'signin' ? 'Ielogoties' : 'Izveidot kontu'}
          </button>
        </div>
      </div>
    </div>
  )
}
