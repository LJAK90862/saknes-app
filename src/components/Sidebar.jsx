import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'
import FriendsPanel from './FriendsPanel'
import ChatPanel from './ChatPanel'

export default function Sidebar({ myProps, onOpenAuth, onEditProp, onDeleteProp, onFlyTo, onAddProp, friendIds, unreadCount, onFriendsChanged }) {
  const { user } = useAuth()
  const showToast = useToast()
  const [activePanel, setActivePanel] = useState('properties')
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!user) return
    setActivePanel('properties')
    // Load profile from Supabase
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setProfileName(data.display_name || user.email.split('@')[0])
        setProfileBio(data.bio || '')
      }
    })
    // Load pending friend request count
    supabase.from('friendships').select('id', { count: 'exact' })
      .eq('addressee_id', user.id).eq('status', 'pending')
      .then(({ count }) => setPendingCount(count || 0))
  }, [user])

  async function saveProfile() {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id, display_name: profileName, bio: profileBio, updated_at: new Date().toISOString()
    })
    if (error) { showToast('Error saving profile', 'error'); return }
    showToast('Profile saved', 'success')
  }

  async function signOut() {
    await supabase.auth.signOut()
    showToast('Signed out')
  }

  const init = user ? user.email[0].toUpperCase() : '?'
  const displayName = user ? (localStorage.getItem(`saknes_name_${user.id}`) || user.email.split('@')[0]) : ''

  return (
    <div className="sidebar">
      {/* User area */}
      <div className="sidebar-user">
        {user ? (
          <>
            <div className="sidebar-avatar">{init}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-sub">{user.email}</div>
            </div>
          </>
        ) : (
          <button className="sidebar-signin-btn" onClick={onOpenAuth}>
            Sign In / Register to track your family
          </button>
        )}
      </div>

      {/* Nav buttons — only when logged in */}
      {user && (
        <div className="sidebar-nav">
          {[
            { id: 'properties', icon: '🏠', label: 'My Properties', count: myProps.length },
            { id: 'connections', icon: '🔗', label: 'My Connections', count: pendingCount || undefined },
            { id: 'chat', icon: '💬', label: 'Chat', count: unreadCount || undefined },
            { id: 'profile', icon: '👤', label: 'My Profile' },
            { id: 'ancestors', icon: '🌳', label: 'My Ancestors' },
          ].map(item => (
            <button
              key={item.id}
              className={`sb-btn ${activePanel === item.id ? 'active' : ''}`}
              onClick={() => setActivePanel(item.id)}
            >
              <span className="sb-icon">{item.icon}</span>
              {item.label}
              {item.count !== undefined && (
                <span className="sb-count">{item.count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Panel content */}
      <div className="sidebar-panel">
        {!user && (
          <div className="coming-soon">
            <span className="coming-soon-icon">🗺</span>
            <div className="coming-soon-title">Welcome to Saknes</div>
            <div className="coming-soon-body">Explore the 1935 map of Latvia. Sign in to add your family properties and track your heritage.</div>
          </div>
        )}

        {user && activePanel === 'properties' && (
          <PropertiesPanel props={myProps} onEdit={onEditProp} onDelete={onDeleteProp} onFly={onFlyTo} onAdd={onAddProp} />
        )}

        {user && activePanel === 'profile' && (
          <ProfilePanel
            init={init} displayName={displayName} email={user.email}
            profileName={profileName} setProfileName={setProfileName}
            profileBio={profileBio} setProfileBio={setProfileBio}
            onSave={saveProfile} onSignOut={signOut}
          />
        )}

        {user && activePanel === 'connections' && (
          <FriendsPanel onFriendsChanged={() => { onFriendsChanged?.(); supabase.from('friendships').select('id', { count: 'exact' }).eq('addressee_id', user.id).eq('status', 'pending').then(({ count }) => setPendingCount(count || 0)) }} />
        )}

        {user && activePanel === 'chat' && (
          <ChatPanel friendIds={friendIds} />
        )}

        {user && activePanel === 'ancestors' && (
          <ComingSoon icon="🌳" title="My Ancestors"
            body="Build your family tree and link ancestors to properties on the map."
            note="Coming soon — ancestor records and family tree tools are in development." />
        )}
      </div>
    </div>
  )
}

function PropertiesPanel({ props, onEdit, onDelete, onFly, onAdd }) {
  if (!props.length) return (
    <div>
      <div className="panel-header">
        <div className="panel-title">My Properties</div>
        <div className="panel-subtitle">Properties you have added to the map</div>
      </div>
      <div className="empty-state">
        <span className="emoji">🏚</span>
        No properties added yet.
        <br />
        <button className="btn-empty" onClick={onAdd}>＋ Add My First Property</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="panel-header">
        <div className="panel-title">My Properties</div>
        <div className="panel-subtitle">{props.length} propert{props.length === 1 ? 'y' : 'ies'} added</div>
      </div>
      <div className="prop-list">
        {props.map(p => (
          <div className="prop-card" key={p.id}>
            <div className="prop-card-top" onClick={() => onFly(p)}>
              <div className="prop-card-img">
                {p.photo_url ? <img src={p.photo_url} alt="" /> : '🏠'}
              </div>
              <div>
                <div className="prop-card-addr">{p.address}</div>
                <div className="prop-card-meta">
                  {p.parish || ''} {p.period ? '· ' + p.period : ''}
                </div>
                <div className="prop-card-chips">
                  {(p.property_families || []).map((f, i) => (
                    <span className="prop-chip" key={i}>{f.name}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="prop-card-actions">
              <button className="prop-card-btn" onClick={() => onEdit(p)}>✏ Edit</button>
              <button className="prop-card-btn" onClick={() => onDelete(p)}>🗑 Delete</button>
              <button className="prop-card-btn" onClick={() => onFly(p)}>🗺 View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfilePanel({ init, displayName, email, profileName, setProfileName, profileBio, setProfileBio, onSave, onSignOut }) {
  return (
    <div>
      <div className="panel-header">
        <div className="panel-title">My Profile</div>
        <div className="panel-subtitle">Your heritage profile</div>
      </div>
      <div className="profile-panel">
        <div className="profile-avatar-lg">{init}</div>
        <div className="profile-name-display">{displayName}</div>
        <div className="profile-email-display">{email}</div>
        <label className="profile-field-label">Display Name</label>
        <input className="profile-input" type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name" />
        <label className="profile-field-label">About your connection to Latvia</label>
        <textarea className="profile-input" value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder="Which region did your family come from? When did they emigrate? What do you know so far…" />
        <button className="btn-save-profile" onClick={onSave}>Save Profile</button>
        <button className="btn-signout" onClick={onSignOut}>Sign Out</button>
      </div>
    </div>
  )
}

function ComingSoon({ icon, title, body, note }) {
  return (
    <div>
      <div className="panel-header">
        <div className="panel-title">{title}</div>
      </div>
      <div className="coming-soon">
        <span className="coming-soon-icon">{icon}</span>
        <div className="coming-soon-title">{title}</div>
        <div className="coming-soon-body">{body}</div>
        <div className="coming-soon-note">{note}</div>
      </div>
    </div>
  )
}
