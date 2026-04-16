import { useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'

export default function AddFriendModal({ onClose, onSent }) {
  const { user } = useAuth()
  const showToast = useToast()
  const { t } = useLingui()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email.trim()) { setError(t`Lūdzu ievadiet e-pasta adresi`); return }
    if (email.trim().toLowerCase() === user.email.toLowerCase()) { setError(t`Nevar pievienot sevi`); return }

    setLoading(true)
    setError('')

    // Find user by email
    const { data: found, error: rpcError } = await supabase.rpc('find_user_by_email', { lookup_email: email.trim().toLowerCase() })

    if (rpcError || !found || found.length === 0) {
      setError(t`Nav atrasts Saknes lietotājs ar šo e-pastu`)
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
      setError(status === 'accepted' ? t`Jau ir draugi` : t`Pieprasījums jau nosūtīts`)
      setLoading(false)
      return
    }

    // Send friend request
    const { error: insertError } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: friendId
    })

    if (insertError) {
      setError(t`Neizdevās nosūtīt pieprasījumu`)
      setLoading(false)
      return
    }

    const displayName = found[0].display_name || email
    showToast(t`Pieprasījums nosūtīts: ${displayName}`, 'success')
    setLoading(false)
    onSent()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 390 }}>
        <div className="modal-hdr">
          <div>
            <div className="modal-hdr-title">{t`Pievienot draugu`}</div>
            <div className="modal-hdr-sub">{t`Meklēt pēc e-pasta adreses`}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bdy">
          <div className="auth-field">
            <label className="auth-label">{t`Drauga e-pasts`}</label>
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
          <button className="btn-cancel" onClick={onClose}>{t`Atcelt`}</button>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? t`Meklē…` : t`Nosūtīt pieprasījumu`}
          </button>
        </div>
      </div>
    </div>
  )
}
