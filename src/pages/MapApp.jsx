import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useLingui } from '@lingui/react/macro'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'
import Sidebar from '../components/Sidebar'
import LanguageSwitcher from '../components/LanguageSwitcher'
import AuthModal from '../components/AuthModal'
import PropertyModal from '../components/PropertyModal'

const LATVIA_BOUNDS = [[55.67, 20.97], [58.08, 28.24]]
const LATVIA_CENTER = [56.87, 24.6]

// ── Map controller — handles layer switching and flying to locations ──
function MapController({ layer, flyTo }) {
  const map = useMap()
  const layers = useRef({})
  const currentLayer = useRef(null)

  useEffect(() => {
    const bounds = L.latLngBounds(LATVIA_BOUNDS[0], LATVIA_BOUNDS[1])
    map.fitBounds(bounds, { padding: [2, 2] })
    setTimeout(() => map.setMinZoom(map.getZoom() - 0.5), 300)
    map.on('drag', () => map.panInsideBounds(bounds, { animate: false }))

    layers.current.wig = L.tileLayer(
      'https://mapproxy.kartes.lv/tiles/1_250k/{z}/{x}/{y}.png',
      { attribution: '© LĢIA', maxZoom: 14, opacity: 0.92 }
    )
    layers.current.modern = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '© OpenStreetMap', maxZoom: 19 }
    )
    layers.current.wig.addTo(map)
    currentLayer.current = 'wig'

    layers.current.wig.on('tileerror', () => {
      if (!map.hasLayer(layers.current.modern)) layers.current.modern.addTo(map)
    })

    return () => { Object.values(layers.current).forEach(l => map.removeLayer(l)) }
  }, [map])

  useEffect(() => {
    if (!layers.current.wig) return
    Object.values(layers.current).forEach(l => map.removeLayer(l))
    layers.current[layer]?.addTo(map)
    currentLayer.current = layer
  }, [layer, map])

  useEffect(() => {
    if (flyTo) map.setView([flyTo.lat, flyTo.lng], 14)
  }, [flyTo, map])

  return null
}

// ── Property markers ──
function PropertyMarkers({ properties, currentUser, onEdit, onDelete, friendIds }) {
  const { t } = useLingui()

  return properties.map(prop => {
    if (!prop.lat || !prop.lng) return null
    const isMine = currentUser && prop.added_by === currentUser.id
    const isFriend = !isMine && friendIds?.includes(prop.added_by)
    const pinColor = isMine ? '#B8832A' : isFriend ? '#d4a855' : '#9B1B30'
    const icon = L.divIcon({
      html: `<div class="custom-pin${isMine ? ' mine' : isFriend ? ' friend' : ''}" style="background:${pinColor}"></div>`,
      iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -24], className: ''
    })
    const families = prop.property_families || []
    return (
      <Marker key={prop.id} position={[prop.lat, prop.lng]} icon={icon}>
        <Popup maxWidth={300}>
          {prop.photo_url
            ? <img className="popup-photo" src={prop.photo_url} alt="" />
            : <div className="popup-photo-placeholder">{'\uD83C\uDFE0'}</div>
          }
          <div className="popup-body">
            <div className="popup-address">{prop.address}{prop.parish ? ` · ${prop.parish}` : ''}</div>
            {families.length > 0 && (
              <div className="popup-families">
                {families.map((f, i) => (
                  <span className="family-chip" key={i}>
                    {f.name}{(f.year_from || f.year_to) ? ` (${f.year_from || '?'}–${f.year_to || '?'})` : ''}
                  </span>
                ))}
              </div>
            )}
            {prop.period && <div className="popup-meta"><div className="popup-meta-row"><span className="popup-meta-label">{t`Periods`}</span>{prop.period}</div></div>}
            {prop.occupation && <div className="popup-meta"><div className="popup-meta-row"><span className="popup-meta-label">{t`Nodarbošanās`}</span>{prop.occupation}</div></div>}
            {prop.notes && <div className="popup-notes">{prop.notes}</div>}
          </div>
          {isMine && (
            <div className="popup-edit-bar">
              <button className="btn-popup-edit" onClick={() => onEdit(prop)}>{t`✏ Rediģēt`}</button>
              <button className="btn-popup-delete" onClick={() => onDelete(prop)}>{'\uD83D\uDDD1'}</button>
            </div>
          )}
        </Popup>
      </Marker>
    )
  })
}

export default function MapApp() {
  const { user } = useAuth()
  const showToast = useToast()
  const { t } = useLingui()

  const [allProps, setAllProps] = useState([])
  const [myProps, setMyProps] = useState([])
  const [layer, setLayer] = useState('wig')
  const [showMineOnly, setShowMineOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [flyTo, setFlyTo] = useState(null)

  const [showAuth, setShowAuth] = useState(false)
  const [editingProp, setEditingProp] = useState(null)
  const [showPropModal, setShowPropModal] = useState(false)
  const [deletingProp, setDeletingProp] = useState(null)
  const [friendIds, setFriendIds] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load all properties
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('properties').select('*, property_families(*)')
      if (!error && data) setAllProps(data)
    }
    load()
  }, [])

  // Load my properties when user changes
  useEffect(() => {
    if (!user) { setMyProps([]); return }
    async function loadMine() {
      const { data } = await supabase
        .from('properties').select('*, property_families(*)')
        .eq('added_by', user.id).order('created_at', { ascending: false })
      setMyProps(data || [])
    }
    loadMine()
  }, [user])

  // Load friend IDs and unread count
  useEffect(() => {
    if (!user) { setFriendIds([]); setUnreadCount(0); return }
    loadFriendIds()
    // Unread messages count
    supabase.from('messages').select('id', { count: 'exact' })
      .eq('receiver_id', user.id).eq('read', false)
      .then(({ count }) => setUnreadCount(count || 0))
    // Realtime unread subscription
    const channel = supabase.channel('unread-count')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => setUnreadCount(c => c + 1)
      ).subscribe()
    return () => channel.unsubscribe()
  }, [user])

  async function loadFriendIds() {
    const { data } = await supabase.from('friendships').select('requester_id, addressee_id')
      .eq('status', 'accepted').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    const ids = (data || []).map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id)
    setFriendIds(ids)
  }

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowSearch(false); return }
    const q = searchQuery.toLowerCase()
    const results = allProps.filter(p =>
      (p.address || '').toLowerCase().includes(q) ||
      (p.parish || '').toLowerCase().includes(q) ||
      (p.notes || '').toLowerCase().includes(q) ||
      (p.occupation || '').toLowerCase().includes(q) ||
      (p.property_families || []).some(f => (f.name || '').toLowerCase().includes(q))
    ).slice(0, 7)
    setSearchResults(results)
    setShowSearch(true)
  }, [searchQuery, allProps])

  // Displayed properties
  const displayedProps = showMineOnly && user
    ? allProps.filter(p => p.added_by === user.id)
    : allProps

  function handleSaved(saved) {
    setAllProps(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      return idx > -1 ? prev.map(p => p.id === saved.id ? saved : p) : [...prev, saved]
    })
    setMyProps(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      return idx > -1 ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]
    })
    if (!editingProp) setFlyTo({ lat: saved.lat, lng: saved.lng })
  }

  async function handleDelete(prop) {
    await supabase.from('property_families').delete().eq('property_id', prop.id)
    const { error } = await supabase.from('properties').delete().eq('id', prop.id).eq('added_by', user.id)
    if (error) { showToast(t`Nevarēja dzēst`, 'error'); return }
    setAllProps(prev => prev.filter(p => p.id !== prop.id))
    setMyProps(prev => prev.filter(p => p.id !== prop.id))
    setDeletingProp(null)
    showToast(t`Dzēsts`, 'success')
  }

  function openAdd() {
    if (!user) { setShowAuth(true); showToast(t`Lūdzu ielogoties, lai pievienotu īpašumu`, 'error'); return }
    setEditingProp(null)
    setShowPropModal(true)
  }

  function openEdit(prop) {
    setEditingProp(prop)
    setShowPropModal(true)
  }

  function handleSearchSelect(prop) {
    setSearchQuery('')
    setShowSearch(false)
    setFlyTo({ lat: prop.lat, lng: prop.lng, ts: Date.now() })
  }

  // Stats
  const famSet = new Set(allProps.flatMap(p => (p.property_families || []).map(f => f.name)))
  const regSet = new Set(allProps.map(p => p.parish?.split(' ')[0]).filter(Boolean))

  const [activePanel, setActivePanel] = useState(null)

  function togglePanel(panel) {
    setActivePanel(prev => prev === panel ? null : panel)
  }

  return (
    <div className="app">
      {/* ── TOPBAR ── */}
      <div className="topbar">
        <a className="topbar-home" href="https://saknes.org">
          <img src="/saknes-logo.jpg" alt="Saknes" style={{ height: 32, width: 'auto' }} />
          <div>
            <div className="topbar-home-text">Saknes</div>
            <div className="topbar-home-back">{t`← Uz sākumu`}</div>
          </div>
        </a>

        <div className="layer-toggle">
          <button className={`layer-btn ${layer === 'wig' ? 'active' : ''}`} onClick={() => setLayer('wig')}>1935</button>
          <button className={`layer-btn ${layer === 'modern' ? 'active' : ''}`} onClick={() => setLayer('modern')}>{t`Tagad`}</button>
        </div>

        <div className="search-wrap">
          <input
            className="search-input"
            type="text"
            placeholder={t`Meklēt īpašumus…`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setShowSearch(false), 180)}
            onFocus={() => searchResults.length && setShowSearch(true)}
          />
          <span className="search-icon">&#128269;</span>
          {showSearch && (
            <div className="search-drop">
              {searchResults.length === 0
                ? <div className="search-no-results">{t`Nav atrasts`}</div>
                : searchResults.map(p => (
                  <div key={p.id} className="search-item" onMouseDown={() => handleSearchSelect(p)}>
                    <div className="search-item-addr">{p.address}</div>
                    <div className="search-item-meta">{p.parish || ''} {(p.property_families || []).map(f => f.name).join(', ')}</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div className="fam-toggle-wrap">
          <span className="fam-toggle-label">{t`Visas ģimenes`}</span>
          <label className="toggle-sw">
            <input type="checkbox" checked={showMineOnly} disabled={!user} onChange={e => setShowMineOnly(e.target.checked)} />
            <span className="toggle-track" />
          </label>
          <span className="fam-toggle-label mine">{t`Mana ģimene`}</span>
        </div>

        <span className="pin-count">{displayedProps.length} {displayedProps.length === 1 ? t`īpašums` : t`īpašumi`}</span>
        <div className="topbar-spacer" />
        <LanguageSwitcher />
        <button className="btn-add" onClick={openAdd}>{t`＋ Pievienot`}</button>
      </div>

      {/* ── HEADER NAV ── */}
      <div className="header-nav">
        {user ? (
          <>
            {[
              { id: 'properties', icon: '\uD83C\uDFE0', label: t`Mani īpašumi`, count: myProps.length },
              { id: 'connections', icon: '\uD83D\uDD17', label: t`Draugi` },
              { id: 'chat', icon: '\uD83D\uDCAC', label: t`Sarunas`, count: unreadCount },
              { id: 'profile', icon: '\uD83D\uDC64', label: t`Profils` },
            ].map(item => (
              <button
                key={item.id}
                className={`header-nav-btn ${activePanel === item.id ? 'active' : ''}`}
                onClick={() => togglePanel(item.id)}
              >
                <span className="header-nav-icon">{item.icon}</span>
                {item.label}
                {item.count ? <span className="header-nav-badge">{item.count}</span> : null}
              </button>
            ))}
          </>
        ) : (
          <button className="header-nav-btn" onClick={() => setShowAuth(true)}>
            <span className="header-nav-icon">{'\uD83D\uDC64'}</span>{t`Ielogoties / Reģistrēties`}
          </button>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="map-body">
        {activePanel && (
          <div className="side-panel">
            <button className="side-panel-close" onClick={() => setActivePanel(null)}>&#10005;</button>
            <Sidebar
              myProps={myProps}
              onOpenAuth={() => setShowAuth(true)}
              onEditProp={openEdit}
              onDeleteProp={p => setDeletingProp(p)}
              onFlyTo={p => setFlyTo({ lat: p.lat, lng: p.lng, ts: Date.now() })}
              onAddProp={openAdd}
              friendIds={friendIds}
              unreadCount={unreadCount}
              onFriendsChanged={loadFriendIds}
              activePanel={activePanel}
            />
          </div>
        )}

        <div className="map-container">
          <MapContainer
            center={LATVIA_CENTER}
            zoom={7}
            maxBounds={LATVIA_BOUNDS}
            maxBoundsViscosity={1.0}
            style={{ width: '100%', height: '100%' }}
            zoomSnap={0.5}
            zoomDelta={0.5}
          >
            <MapController layer={layer} flyTo={flyTo} />
            <PropertyMarkers
              properties={displayedProps}
              currentUser={user}
              onEdit={openEdit}
              onDelete={p => setDeletingProp(p)}
              friendIds={friendIds}
            />
          </MapContainer>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {showPropModal && (
        <PropertyModal
          prop={editingProp}
          onClose={() => { setShowPropModal(false); setEditingProp(null) }}
          onSaved={handleSaved}
        />
      )}

      {deletingProp && (
        <div className="modal-backdrop confirm-modal" onClick={e => e.target === e.currentTarget && setDeletingProp(null)}>
          <div className="modal-box" style={{ maxWidth: 340 }}>
            <div className="modal-hdr">
              <div>
                <div className="modal-hdr-title">{t`Dzēst šo īpašumu?`}</div>
                <div className="modal-hdr-sub">{t`To nevar atsaukt`}</div>
              </div>
              <button className="modal-close" onClick={() => setDeletingProp(null)}>✕</button>
            </div>
            <div className="modal-bdy">
              <p className="confirm-body">{t`Šis neatgriezeniski noņems īpašumu un visus saistītos ģimenes ierakstus no kartes.`}</p>
            </div>
            <div className="modal-ftr">
              <button className="btn-cancel" onClick={() => setDeletingProp(null)}>{t`Atcelt`}</button>
              <button className="btn-delete" onClick={() => handleDelete(deletingProp)}>{t`Dzēst`}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
