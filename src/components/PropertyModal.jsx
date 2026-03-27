import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'

const LATVIA_BOUNDS = [[55.67, 20.97], [58.08, 28.24]]
const LATVIA_CENTER = [56.87, 24.6]

function LocationPicker({ onSelect, initial }) {
  const [pos, setPos] = useState(initial || null)
  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng])
      onSelect(e.latlng.lat.toFixed(5), e.latlng.lng.toFixed(5))
    }
  })
  const icon = L.divIcon({
    html: '<div style="width:12px;height:12px;background:#9B1B30;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
    iconSize: [12, 12], iconAnchor: [6, 6], className: ''
  })
  return pos ? <Marker position={pos} icon={icon} /> : null
}

export default function PropertyModal({ prop, onClose, onSaved }) {
  const { user } = useAuth()
  const showToast = useToast()
  const isEdit = !!prop

  const [address, setAddress] = useState(prop?.address || '')
  const [parish, setParish] = useState(prop?.parish || '')
  const [period, setPeriod] = useState(prop?.period || '')
  const [occupation, setOccupation] = useState(prop?.occupation || '')
  const [notes, setNotes] = useState(prop?.notes || '')
  const [families, setFamilies] = useState(prop?.property_families?.length ? prop.property_families : [{ name: '', year_from: '', year_to: '' }])
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(prop?.photo_url || null)
  const [lat, setLat] = useState(prop?.lat?.toFixed(5) || null)
  const [lng, setLng] = useState(prop?.lng?.toFixed(5) || null)
  const [saving, setSaving] = useState(false)

  function handlePhoto(e) {
    const f = e.target.files[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  function addFamily() { setFamilies(f => [...f, { name: '', year_from: '', year_to: '' }]) }
  function removeFamily(i) { setFamilies(f => f.filter((_, idx) => idx !== i)) }
  function updateFamily(i, field, val) { setFamilies(f => f.map((fam, idx) => idx === i ? { ...fam, [field]: val } : fam)) }

  async function handleSave() {
    if (!address.trim()) { showToast('Please enter an address', 'error'); return }
    if (!lat || !lng) { showToast('Please click the map to set a location', 'error'); return }
    setSaving(true)

    let photo_url = prop?.photo_url || null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const fn = `${user.id}_${Date.now()}.${ext}`
      const { data: ud, error: ue } = await supabase.storage.from('property-photos').upload(fn, photoFile, { contentType: photoFile.type })
      if (!ue && ud) {
        const { data: urlData } = supabase.storage.from('property-photos').getPublicUrl(fn)
        photo_url = urlData?.publicUrl
      }
    }

    const payload = {
      address: address.trim(),
      parish: parish.trim() || null,
      period: period.trim() || null,
      occupation: occupation.trim() || null,
      notes: notes.trim() || null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      ...(photo_url ? { photo_url } : {})
    }

    const validFamilies = families.filter(f => f.name.trim())

    if (isEdit) {
      const { error } = await supabase.from('properties').update(payload).eq('id', prop.id).eq('added_by', user.id)
      if (error) { showToast('Error saving', 'error'); setSaving(false); return }
      await supabase.from('property_families').delete().eq('property_id', prop.id)
      if (validFamilies.length) {
        await supabase.from('property_families').insert(validFamilies.map(f => ({
          property_id: prop.id,
          name: f.name.trim(),
          year_from: f.year_from ? parseInt(f.year_from) : null,
          year_to: f.year_to ? parseInt(f.year_to) : null
        })))
      }
      showToast('✓ Updated', 'success')
      onSaved({ ...prop, ...payload, property_families: validFamilies })
    } else {
      const { data: pd, error: pe } = await supabase.from('properties').insert([{ ...payload, added_by: user.id }]).select().single()
      if (pe) { showToast('Error saving', 'error'); setSaving(false); return }
      if (validFamilies.length && pd?.id) {
        await supabase.from('property_families').insert(validFamilies.map(f => ({
          property_id: pd.id,
          name: f.name.trim(),
          year_from: f.year_from ? parseInt(f.year_from) : null,
          year_to: f.year_to ? parseInt(f.year_to) : null
        })))
      }
      showToast('✓ Property added!', 'success')
      onSaved({ ...pd, property_families: validFamilies })
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop prop-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <div>
            <div className="modal-hdr-title">{isEdit ? 'Edit Property' : 'Add Your Family Property'}</div>
            <div className="modal-hdr-sub">Pievienot ģimenes īpašumu · Add a property to the heritage map</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-bdy">
          {/* Photo */}
          <div className="modal-section">
            <div className="modal-section-title">Property Photo</div>
            <label className="photo-upload-area">
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              <div className="photo-upload-icon">🏠</div>
              <div className="photo-upload-text"><strong>Click to upload a photo</strong><br />Historical or recent — any image of the property</div>
            </label>
            {photoPreview && <img className="photo-preview-img" src={photoPreview} alt="Preview" />}
          </div>

          {/* Details */}
          <div className="modal-section">
            <div className="modal-section-title">Property Details</div>
            <div className="field-group">
              <label className="field-label">Address or Place Name</label>
              <input className="field-input" type="text" placeholder="e.g. Rīgas iela 12, Cēsis / Jaunbērziņi farm, Vidzeme" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Parish / Region</label>
                <input className="field-input" type="text" placeholder="e.g. Cēsu pagasts" value={parish} onChange={e => setParish(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Period (years)</label>
                <input className="field-input" type="text" placeholder="e.g. 1890–1944" value={period} onChange={e => setPeriod(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Families */}
          <div className="modal-section">
            <div className="modal-section-title">Family Names</div>
            <div className="field-hint">Add each family that lived here (with years if known)</div>
            <div className="family-rows">
              {families.map((fam, i) => (
                <div className="family-row" key={i}>
                  <input className="field-input" type="text" placeholder="Family surname" value={fam.name} onChange={e => updateFamily(i, 'name', e.target.value)} style={{ height: 30, padding: '3px 8px' }} />
                  <input className="field-input" type="number" placeholder="From" value={fam.year_from} onChange={e => updateFamily(i, 'year_from', e.target.value)} style={{ height: 30, padding: '3px 5px', textAlign: 'center' }} />
                  <input className="field-input" type="number" placeholder="To" value={fam.year_to} onChange={e => updateFamily(i, 'year_to', e.target.value)} style={{ height: 30, padding: '3px 5px', textAlign: 'center' }} />
                  <button className="btn-rm-family" onClick={() => families.length > 1 && removeFamily(i)}>✕</button>
                </div>
              ))}
            </div>
            <button className="btn-add-family" onClick={addFamily}>＋ Add another family</button>
          </div>

          {/* Occupation */}
          <div className="modal-section">
            <div className="modal-section-title">Occupation / Trade</div>
            <input className="field-input" type="text" placeholder="e.g. Farmer, Blacksmith / Zemnieks, Kalējs" value={occupation} onChange={e => setOccupation(e.target.value)} />
          </div>

          {/* Notes */}
          <div className="modal-section">
            <div className="modal-section-title">Additional Notes</div>
            <textarea className="field-input" placeholder="Any additional history, stories, or context…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Location */}
          <div className="modal-section">
            <div className="modal-section-title">Location on Map</div>
            <p className="location-hint">Click on the map below to pin the property location</p>
            <div className="picker-map">
              <MapContainer
                center={lat && lng ? [parseFloat(lat), parseFloat(lng)] : LATVIA_CENTER}
                zoom={lat && lng ? 12 : 6}
                style={{ width: '100%', height: '175px' }}
                maxBounds={LATVIA_BOUNDS}
                maxBoundsViscosity={0.9}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                <LocationPicker
                  initial={lat && lng ? [parseFloat(lat), parseFloat(lng)] : null}
                  onSelect={(la, ln) => { setLat(la); setLng(ln) }}
                />
              </MapContainer>
            </div>
            <div className="location-coords">
              {lat && lng ? `📍 ${lat}° N, ${lng}° E` : 'No location selected — click the map above'}
            </div>
          </div>
        </div>

        <div className="modal-ftr">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-submit" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit to Map'}
          </button>
        </div>
      </div>
    </div>
  )
}
