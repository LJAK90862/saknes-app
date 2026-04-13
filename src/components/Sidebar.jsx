import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, useToast, useLang } from '../App'
import FriendsPanel from './FriendsPanel'
import ChatPanel from './ChatPanel'

export default function Sidebar({ myProps, onOpenAuth, onEditProp, onDeleteProp, onFlyTo, onAddProp, friendIds, unreadCount, onFriendsChanged, activePanel }) {
  const { user } = useAuth()
  const showToast = useToast()
  const { t } = useLang()
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
    if (error) { showToast(t('toast.profileError'), 'error'); return }
    showToast(t('toast.profileSaved'), 'success')
  }

  async function signOut() {
    await supabase.auth.signOut()
    showToast(t('toast.signedOut'))
  }

  const init = user ? user.email[0].toUpperCase() : '?'
  const displayName = profileName || (user ? user.email.split('@')[0] : '')

  return (
    <div className="sidebar-content">
      {activePanel === 'properties' && (
        <PropertiesPanel props={myProps} onEdit={onEditProp} onDelete={onDeleteProp} onFly={onFlyTo} onAdd={onAddProp} t={t} />
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
          onSave={saveProfile} onSignOut={signOut} t={t}
        />
      )}
    </div>
  )
}

function PropertiesPanel({ props, onEdit, onDelete, onFly, onAdd, t }) {
  if (!props.length) return (
    <div>
      <div className="panel-header">
        <div className="panel-title">{t('props.title')}</div>
        <div className="panel-subtitle">{t('props.subtitle')}</div>
      </div>
      <div className="empty-state">
        <span className="emoji">{'\uD83C\uDFDA'}</span>
        {t('props.empty')}
        <br />
        <button className="btn-empty" onClick={onAdd}>{t('props.addFirst')}</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="panel-header">
        <div className="panel-title">{t('props.title')}</div>
        <div className="panel-subtitle">{props.length} {props.length === 1 ? t('topbar.property') : t('topbar.properties')}</div>
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
              <button className="prop-card-btn" onClick={() => onEdit(p)}>{t('props.edit')}</button>
              <button className="prop-card-btn" onClick={() => onDelete(p)}>{t('props.delete')}</button>
              <button className="prop-card-btn" onClick={() => onFly(p)}>{t('props.view')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfilePanel({ init, displayName, email, profileName, setProfileName, profileBio, setProfileBio, onSave, onSignOut, t }) {
  return (
    <div>
      <div className="panel-header">
        <div className="panel-title">{t('profile.title')}</div>
        <div className="panel-subtitle">{t('profile.subtitle')}</div>
      </div>
      <div className="profile-panel">
        <div className="profile-avatar-lg">{init}</div>
        <div className="profile-name-display">{displayName}</div>
        <div className="profile-email-display">{email}</div>
        <label className="profile-field-label">{t('profile.nameLabel')}</label>
        <input className="profile-input" type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder={t('profile.namePlaceholder')} />
        <label className="profile-field-label">{t('profile.bioLabel')}</label>
        <textarea className="profile-input" value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder={t('profile.bioPlaceholder')} />
        <button className="btn-save-profile" onClick={onSave}>{t('profile.save')}</button>
        <button className="btn-signout" onClick={onSignOut}>{t('profile.signout')}</button>
      </div>
    </div>
  )
}
