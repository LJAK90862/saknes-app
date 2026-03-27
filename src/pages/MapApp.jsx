import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'
import Sidebar from '../components/Sidebar'
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
function PropertyMarkers({ properties, currentUser, onEdit, onDelete }) {
  return properties.map(prop => {
    if (!prop.lat || !prop.lng) return null
    const isMine = currentUser && prop.added_by === currentUser.id
    const icon = L.divIcon({
      html: `<div class="custom-pin${isMine ? ' mine' : ''}" style="background:${isMine ? '#B8832A' : '#9B1B30'}"></div>`,
      iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -24], className: ''
    })
    const families = prop.property_families || []
    return (
      <Marker key={prop.id} position={[prop.lat, prop.lng]} icon={icon}>
        <Popup maxWidth={300}>
          {prop.photo_url
            ? <img className="popup-photo" src={prop.photo_url} alt="" />
            : <div className="popup-photo-placeholder">🏠</div>
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
            {prop.period && <div className="popup-meta"><div className="popup-meta-row"><span className="popup-meta-label">Period</span>{prop.period}</div></div>}
            {prop.occupation && <div className="popup-meta"><div className="popup-meta-row"><span className="popup-meta-label">Occupation</span>{prop.occupation}</div></div>}
            {prop.notes && <div className="popup-notes">{prop.notes}</div>}
          </div>
          {isMine && (
            <div className="popup-edit-bar">
              <button className="btn-popup-edit" onClick={() => onEdit(prop)}>✏ Edit</button>
              <button className="btn-popup-delete" onClick={() => onDelete(prop)}>🗑</button>
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
    if (error) { showToast('Could not delete', 'error'); return }
    setAllProps(prev => prev.filter(p => p.id !== prop.id))
    setMyProps(prev => prev.filter(p => p.id !== prop.id))
    setDeletingProp(null)
    showToast('Deleted', 'success')
  }

  function openAdd() {
    if (!user) { setShowAuth(true); showToast('Please sign in to add a property', 'error'); return }
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

  return (
    <div className="app">
      {/* ── TOPBAR ── */}
      <div className="topbar">
        <a className="topbar-home" href="https://saknes.org">
          <span className="topbar-home-rune">ᛋ</span>
          <div>
            <div className="topbar-home-text">Saknes</div>
            <div className="topbar-home-back">← Back to home</div>
          </div>
        </a>

        <div className="layer-toggle">
          <button className={`layer-btn ${layer === 'wig' ? 'active' : ''}`} onClick={() => setLayer('wig')}>1935</button>
          <button className={`layer-btn ${layer === 'modern' ? 'active' : ''}`} onClick={() => setLayer('modern')}>Now</button>
        </div>

        <div className="search-wrap">
          <input
            className="search-input"
            type="text"
            placeholder="Search properties…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setShowSearch(false), 180)}
            onFocus={() => searchResults.length && setShowSearch(true)}
          />
          <span className="search-icon">🔍</span>
          {showSearch && (
            <div className="search-drop">
              {searchResults.length === 0
                ? <div className="search-no-results">No properties found</div>
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
          <span className="fam-toggle-label">All families</span>
          <label className="toggle-sw">
            <input
              type="checkbox"
              checked={showMineOnly}
              disabled={!user}
              onChange={e => setShowMineOnly(e.target.checked)}
            />
            <span className="toggle-track" />
          </label>
          <span className="fam-toggle-label mine">My family</span>
        </div>

        <span className="pin-count">{displayedProps.length} propert{displayedProps.length === 1 ? 'y' : 'ies'}</span>
        <div className="topbar-spacer" />
        <button className="btn-add" onClick={openAdd}>＋ Add Property</button>
      </div>

      {/* ── BODY ── */}
      <div className="map-body">
        <Sidebar
          myProps={myProps}
          onOpenAuth={() => setShowAuth(true)}
          onEditProp={openEdit}
          onDeleteProp={p => setDeletingProp(p)}
          onFlyTo={p => setFlyTo({ lat: p.lat, lng: p.lng, ts: Date.now() })}
          onAddProp={openAdd}
        />

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
                <div className="modal-hdr-title">Delete this property?</div>
                <div className="modal-hdr-sub">This cannot be undone</div>
              </div>
              <button className="modal-close" onClick={() => setDeletingProp(null)}>✕</button>
            </div>
            <div className="modal-bdy">
              <p className="confirm-body">This will permanently remove the property and all associated family records from the map.</p>
            </div>
            <div className="modal-ftr">
              <button className="btn-cancel" onClick={() => setDeletingProp(null)}>Cancel</button>
              <button className="btn-delete" onClick={() => handleDelete(deletingProp)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
