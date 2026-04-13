import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, useToast, useLang } from '../App'
import AddFriendModal from './AddFriendModal'

export default function FriendsPanel({ onFriendsChanged }) {
  const { user } = useAuth()
  const showToast = useToast()
  const { t } = useLang()
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) loadFriends() }, [user])

  async function loadFriends() {
    setLoading(true)

    // Pie\u0146emted friends
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
    showToast(t('friends.accepted'), 'success')
    loadFriends()
    onFriendsChanged?.()
  }

  async function declineRequest(friendshipId) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    showToast(t('friends.declined'))
    loadFriends()
    onFriendsChanged?.()
  }

  async function removeFriend(friendshipId) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    showToast(t('friends.removed'))
    loadFriends()
    onFriendsChanged?.()
  }

  if (loading) return <div className="coming-soon"><span className="coming-soon-icon">{'\uD83D\uDD17'}</span><div className="coming-soon-body">{t('friends.loading')}</div></div>

  return (
    <div>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="panel-title">{t('friends.title')}</div>
          <div className="panel-subtitle">{friends.length} {friends.length === 1 ? 'friend' : 'friends'}</div>
        </div>
        <button className="btn-empty" onClick={() => setShowAddModal(true)} style={{ margin: 0, padding: '5px 12px', fontSize: '.7rem' }}>{t('friends.add')}</button>
      </div>

      {pending.length > 0 && (
        <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', background: 'var(--linen)' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--carmine)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Gaido\u0161ie piepras\u012bjumi</div>
          {pending.map(p => (
            <div key={p.friendshipId} className="friend-card">
              <div className="friend-card-top">
                <div className="friend-avatar">{(p.display_name || '?')[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div className="friend-name">{p.display_name || 'Unknown'}</div>
                </div>
              </div>
              <div className="prop-card-actions">
                <button className="prop-card-btn" onClick={() => acceptRequest(p.friendshipId)} style={{ color: 'var(--carmine)', fontWeight: 600 }}>✓ Pie\u0146emt</button>
                <button className="prop-card-btn" onClick={() => declineRequest(p.friendshipId)}>✕ Noraid\u012bt</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '10px' }}>
        {friends.length === 0 && pending.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">🔗</span>
            V&#275;l nav draugu.<br />Pievienojiet draugu p&#275;c e-pasta, lai redz&#275;tu vi&#326;u &#291;imenes &#299;pa&#353;umus kart&#275;.
            <br /><button className="btn-empty" onClick={() => setShowAddModal(true)}>&#xFF0B; Pievienot draugu</button>
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
                <button className="prop-card-btn" onClick={() => removeFriend(f.friendshipId)}>No\u0146emt</button>
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
