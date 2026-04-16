import { useState, useEffect } from 'react'
import { useLingui } from '@lingui/react/macro'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'
import AddFriendModal from './AddFriendModal'

export default function FriendsPanel({ onFriendsChanged }) {
  const { user } = useAuth()
  const showToast = useToast()
  const { t } = useLingui()
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) loadFriends() }, [user])

  async function loadFriends() {
    setLoading(true)

    // Pieņemted friends
    const { data: accepted } = await supabase
      .from('friendships')
      .select('id, requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    // Pending requests TO me
    const { data: pendingReqs } = await supabase
      .from('friendships')
      .select('id, requester_id')
      .eq('addressee_id', user.id)
      .eq('status', 'pending')

    // Get all friend user IDs
    const friendUserIds = (accepted || []).map(f =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )
    const pendingUserIds = (pendingReqs || []).map(f => f.requester_id)
    const allIds = [...new Set([...friendUserIds, ...pendingUserIds])]

    // Fetch profiles
    let profiles = {}
    if (allIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name, bio')
        .in('id', allIds)
      ;(profs || []).forEach(p => { profiles[p.id] = p })
    }

    setFriends((accepted || []).map(f => {
      const fid = f.requester_id === user.id ? f.addressee_id : f.requester_id
      return { friendshipId: f.id, userId: fid, ...profiles[fid] }
    }))

    setPending((pendingReqs || []).map(f => ({
      friendshipId: f.id, userId: f.requester_id, ...profiles[f.requester_id]
    })))

    setLoading(false)
  }

  async function acceptRequest(friendshipId) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    showToast(t`Drauga pieprasījums pieņemts`, 'success')
    loadFriends()
    onFriendsChanged?.()
  }

  async function declineRequest(friendshipId) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    showToast(t`Pieprasījums noraidīts`)
    loadFriends()
    onFriendsChanged?.()
  }

  async function removeFriend(friendshipId) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    showToast(t`Draugs noņemts`)
    loadFriends()
    onFriendsChanged?.()
  }

  if (loading) return <div className="coming-soon"><span className="coming-soon-icon">{'\uD83D\uDD17'}</span><div className="coming-soon-body">{t`Ielādē…`}</div></div>

  return (
    <div>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="panel-title">{t`Mani draugi`}</div>
          <div className="panel-subtitle">{friends.length} {friends.length === 1 ? t`draugs` : t`draugi`}</div>
        </div>
        <button className="btn-empty" onClick={() => setShowAddModal(true)} style={{ margin: 0, padding: '5px 12px', fontSize: '.7rem' }}>{t`＋ Pievienot`}</button>
      </div>

      {pending.length > 0 && (
        <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', background: 'var(--linen)' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--carmine)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>{t`Gaidošie pieprasījumi`}</div>
          {pending.map(p => (
            <div key={p.friendshipId} className="friend-card">
              <div className="friend-card-top">
                <div className="friend-avatar">{(p.display_name || '?')[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div className="friend-name">{p.display_name || 'Unknown'}</div>
                </div>
              </div>
              <div className="prop-card-actions">
                <button className="prop-card-btn" onClick={() => acceptRequest(p.friendshipId)} style={{ color: 'var(--carmine)', fontWeight: 600 }}>{t`✓ Pieņemt`}</button>
                <button className="prop-card-btn" onClick={() => declineRequest(p.friendshipId)}>{t`✕ Noraidīt`}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '10px' }}>
        {friends.length === 0 && pending.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">{'\uD83D\uDD17'}</span>
            {t`Vēl nav draugu. Pievienojiet draugu pēc e-pasta, lai redzētu viņu ģimenes īpašumus kartē.`}
            <br /><button className="btn-empty" onClick={() => setShowAddModal(true)}>{t`＋ Pievienot draugu`}</button>
          </div>
        ) : (
          friends.map(f => (
            <div key={f.friendshipId} className="friend-card">
              <div className="friend-card-top">
                <div className="friend-avatar">{(f.display_name || '?')[0].toUpperCase()}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div className="friend-name">{f.display_name || 'Unknown'}</div>
                  {f.bio && <div className="friend-bio">{f.bio}</div>}
                </div>
              </div>
              <div className="prop-card-actions">
                <button className="prop-card-btn" onClick={() => removeFriend(f.friendshipId)}>{t`Noņemt`}</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddFriendModal
          onClose={() => setShowAddModal(false)}
          onSent={() => { setShowAddModal(false); loadFriends(); onFriendsChanged?.() }}
        />
      )}
    </div>
  )
}
