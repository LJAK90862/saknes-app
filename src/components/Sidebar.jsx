import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'
import FriendsPanel from './FriendsPanel'
import ChatPanel from './ChatPanel'

export default function Sidebar({ myProps, onOpenAuth, onEditProp, onDeleteProp, onFlyTo, onAddProp, friendIds, unreadCount, onFriendsChanged, activePanel }) {
  const { user } = useAuth()
  const showToast = useToast()
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setProfileName(data.display_name || user.email.split('@')[0])
        setProfileBio(data.bio || '')
      }
    })
  }, [user])

  async function saveProfile() {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id, display_name: profileName, bio: profileBio, updated_at: new Date().toISOString()
    })
    if (error) { showToast('K\u013c\u016bda saglab\u0101jot', 'error'); return }
    showToast('Profils saglab\u0101ts', 'success')
  }

  async function signOut() {
    await supabase.auth.signOut()
    showToast('Izrakst\u012bj\u0101ties')
  }

  const init = user ? user.email[0].toUpperCase() : '?'
  const displayName = profileName || (user ? user.email.split('@')[0] : '')

  return (
    <div className="sidebar-content">
      {activePanel === 'properties' && (
        <PropertiesPanel props={myProps} onEdit={onEditProp} onDelete={onDeleteProp} onFly={onFlyTo} onAdd={onAddProp} />
      )}

      {activePanel === 'connections' && (
        <FriendsPanel onFriendsChanged={onFriendsChanged} />
      )}

      {activePanel === 'chat' && (
        <ChatPanel friendIds={friendIds} />
      )}

      {activePanel === 'profile' && (
        <ProfilePanel
          init={init} displayName={displayName} email={user?.email}
          profileName={profileName} setProfileName={setProfileName}
          profileBio={profileBio} setProfileBio={setProfileBio}
          onSave={saveProfile} onSignOut={signOut}
        />
      )}
    </div>
  )
}

function PropertiesPanel({ props, onEdit, onDelete, onFly, onAdd }) {
  if (!props.length) return (
    <div>
      <div className="panel-header">
        <div className="panel-title">Mani \u012bpa\u0161umi</div>
        <div className="panel-subtitle">\u012apa\u0161umi, ko esat pievienojis kartei</div>
      </div>
      <div className="empty-state">
        <span className="emoji">&#127962;</span>
        V\u0113l nav pievienotu \u012bpa\u0161umu.
        <br />
        <button className="btn-empty" onClick={onAdd}>&#xFF0B; Pievienot pirmo \u012bpa\u0161umu</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="panel-header">
        <div className="panel-title">Mani \u012bpa\u0161umi</div>
        <div className="panel-subtitle">{props.length} \u012bpa\u0161um{props.length === 1 ? 's' : 'i'}</div>
      </div>
      <div className="prop-list">
        {props.map(p => (
          <div className="prop-card" key={p.id}>
            <div className="prop-card-top" onClick={() => onFly(p)}>
              <div className="prop-card-img">
                {p.photo_url ? <img src={p.photo_url} alt="" /> : '&#127968;'}
              </div>
              <div>
                <div className="prop-card-addr">{p.address}</div>
                <div className="prop-card-meta">
                  {p.parish || ''} {p.period ? '\u00b7 ' + p.period : ''}
                </div>
                <div className="prop-card-chips">
                  {(p.property_families || []).map((f, i) => (
                    <span className="prop-chip" key={i}>{f.name}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="prop-card-actions">
              <button className="prop-card-btn" onClick={() => onEdit(p)}>&#9998; Redi\u0123\u0113t</button>
              <button className="prop-card-btn" onClick={() => onDelete(p)}>&#128465; Dz\u0113st</button>
              <button className="prop-card-btn" onClick={() => onFly(p)}>&#128506; Skat\u012bt</button>
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
        <div className="panel-title">Mans profils</div>
        <div className="panel-subtitle">J\u016bsu mantojuma profils</div>
      </div>
      <div className="profile-panel">
        <div className="profile-avatar-lg">{init}</div>
        <div className="profile-name-display">{displayName}</div>
        <div className="profile-email-display">{email}</div>
        <label className="profile-field-label">V\u0101rds</label>
        <input className="profile-input" type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="J\u016bsu v\u0101rds" />
        <label className="profile-field-label">Par j\u016bsu saikni ar Latviju</label>
        <textarea className="profile-input" value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder="No kura re\u0123iona n\u0101ca j\u016bsu \u0123imene? Kad vi\u0146i emigr\u0113ja?" />
        <button className="btn-save-profile" onClick={onSave}>Saglab\u0101t profilu</button>
        <button className="btn-signout" onClick={onSignOut}>Izrakst\u012bties</button>
      </div>
    </div>
  )
}
