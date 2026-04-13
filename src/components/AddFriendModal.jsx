import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'

export default function AddFriendModal({ onClose, onSent }) {
  const { user } = useAuth()
  const showToast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email.trim()) { setError('L\u016bdzu ievadiet e-pasta adresi'); return }
    if (email.trim().toLowerCase() === user.email.toLowerCase()) { setError('Nevar pievienot sevi'); return }

    setLoading(true)
    setError('')

    // Find user by email
    const { data: found, error: rpcError } = await supabase.rpc('find_user_by_email', { lookup_email: email.trim().toLowerCase() })

    if (rpcError || !found || found.length === 0) {
      setError('Nav atrasts Saknes lietot\u0101js ar \u0161o e-pastu')
      setLoading(false)
      return
    }

    const friendId = found[0].id

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`)

    if (existing && existing.length > 0) {
      const status = existing[0].status
      setError(status === 'accepted' ? 'Jau ir draugi' : status === 'pending' ? 'Piepras\u012bjums jau nos\u016bt\u012bts' : 'Piepras\u012bjums jau past\u0101v')
      setLoading(false)
      return
    }

    // Send friend request
    const { error: insertError } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: friendId
    })

    if (insertError) {
      setError('Neizdev\u0101s nos\u016bt\u012bt piepras\u012bjumu')
      setLoading(false)
      return
    }

    showToast(`Piepras\u012bjums nos\u016bt\u012bts: ${found[0].display_name || email}`, 'success')
    setLoading(false)
    onSent()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 390 }}>
        <div className="modal-hdr">
          <div>
            <div className="modal-hdr-title">Pievienot draugu</div>
            <div className="modal-hdr-sub">Mekl&#275;t p&#275;c e-pasta adreses</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bdy">
          <div className="auth-field">
            <label className="auth-label">Drauga e-pasts</label>
            <input
              className="auth-input"
              type="email"
              placeholder="their@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
        </div>
        <div className="modal-ftr">
          <button className="btn-cancel" onClick={onClose}>Atcelt</button>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Mekl\u0113...' : 'Nos\u016bt\u012bt piepras\u012bjumu'}
          </button>
        </div>
      </div>
    </div>
  )
}
