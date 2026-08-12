import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './AddPet.css'

const SPECIES = ['Perro', 'Gato', 'Conejo', 'Pájaro', 'Pez', 'Tortuga', 'Hámster', 'Otro']
const COLORS = ['#E8875A', '#6AAF7B', '#7AB8D4', '#A98FCC', '#F2C14E', '#1F2937', '#8B6344', '#E07070']
const SPECIES_EMOJI = {
  'Perro': '🐕', 'Gato': '🐈', 'Conejo': '🐇', 'Pájaro': '🐦',
  'Pez': '🐠', 'Tortuga': '🐢', 'Hámster': '🐹', 'Otro': '🐾',
}

export default function EditPet({ pets, updatePet }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const pet = pets.find(p => p.id === id)
  const photoInputRef = useRef()

  const [form, setForm] = useState(() => pet ? {
    name: pet.name || '',
    species: pet.species || 'Perro',
    breed: pet.breed || '',
    gender: pet.gender || 'macho',
    birthYear: pet.birthYear || new Date().getFullYear(),
    deathYear: pet.deathYear || '',
    color: pet.color || COLORS[0],
    description: pet.description || '',
    parents: pet.parents || [],
    offspring: pet.offspring || [],
    nicknames: pet.nicknames || [],
    profilePhoto: pet.profilePhoto || null,
  } : null)

  const [newNickname, setNewNickname] = useState('')

  if (!pet || !form) return (
    <div className="page container">
      <div className="empty-state"><div className="emoji">🔍</div><h2>Mascota no encontrada</h2></div>
    </div>
  )

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const toggleRelation = (field, relId) => {
    if (relId === id) return // can't relate to itself
    setForm(f => ({
      ...f,
      [field]: f[field].includes(relId)
        ? f[field].filter(x => x !== relId)
        : [...f[field], relId]
    }))
  }

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Compress to max ~400px wide
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxW = 400
      const ratio = Math.min(1, maxW / img.width)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setForm(f => ({ ...f, profilePhoto: dataUrl }))
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const addNickname = () => {
    const nick = newNickname.trim()
    if (!nick || form.nicknames.length >= 5 || form.nicknames.includes(nick)) return
    setForm(f => ({ ...f, nicknames: [...f.nicknames, nick] }))
    setNewNickname('')
  }

  const removeNickname = (nick) => {
    setForm(f => ({ ...f, nicknames: f.nicknames.filter(n => n !== nick) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updatePet(id, {
      ...form,
      birthYear: parseInt(form.birthYear),
      deathYear: form.deathYear ? parseInt(form.deathYear) : null,
    })
    navigate(`/pet/${id}`)
  }

  const emoji = SPECIES_EMOJI[form.species] || '🐾'

  return (
    <div className="page add-page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="add-header">
          <h1>✏️ Editar mascota</h1>
          <p>Modificá los datos de {pet.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="add-form card card-body">

          {/* Profile photo */}
          <div className="form-section" style={{ textAlign: 'center' }}>
            <h3>📷 Foto de perfil</h3>
            <div style={{ marginTop: '1rem', display: 'inline-block', position: 'relative' }}>
              <div
                onClick={() => photoInputRef.current.click()}
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: `${form.color}22`,
                  border: `3px dashed ${form.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', position: 'relative',
                }}
              >
                {form.profilePhoto ? (
                  <img src={form.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>{emoji}</span>
                )}
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s',
                  borderRadius: '50%',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>📷</span>
                </div>
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handleProfilePhoto} style={{ display: 'none' }} />
            </div>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tocá para cambiar la foto</p>
            {form.profilePhoto && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm(f => ({ ...f, profilePhoto: null }))} style={{ marginTop: '0.5rem' }}>
                🗑️ Quitar foto
              </button>
            )}
          </div>

          {/* Basic */}
          <div className="form-section">
            <h3>📋 Datos básicos</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" value={form.name} onChange={set('name')} placeholder="Ej: Luna" required />
              </div>
              <div className="form-group">
                <label className="form-label">Especie *</label>
                <select className="form-select" value={form.species} onChange={set('species')}>
                  {SPECIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Raza</label>
                <input className="form-input" value={form.breed} onChange={set('breed')} placeholder="Ej: Golden Retriever" />
              </div>
              <div className="form-group">
                <label className="form-label">Género</label>
                <select className="form-select" value={form.gender} onChange={set('gender')}>
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Año de nacimiento *</label>
                <input type="number" className="form-input" value={form.birthYear} onChange={set('birthYear')} min="1900" max="2100" required />
              </div>
              <div className="form-group">
                <label className="form-label">Año de partida <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(si aplica)</span></label>
                <input type="number" className="form-input" value={form.deathYear} onChange={set('deathYear')} min="1900" max="2100" placeholder="Dejar vacío si está vivo" />
              </div>
            </div>
          </div>

          {/* Nicknames */}
          <div className="form-section">
            <h3>😄 Apodos <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85em' }}>(máx. 5)</span></h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {form.nicknames.map(nick => (
                <span key={nick} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  background: 'var(--primary-light, #FFF3E0)', color: 'var(--primary)',
                  borderRadius: 20, padding: '0.25rem 0.7rem', fontSize: '0.9rem', fontWeight: 500,
                }}>
                  {nick}
                  <button type="button" onClick={() => removeNickname(nick)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}>✕</button>
                </span>
              ))}
            </div>
            {form.nicknames.length < 5 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  value={newNickname}
                  onChange={e => setNewNickname(e.target.value)}
                  placeholder="Ej: Lunita, Pulga..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNickname() } }}
                  maxLength={20}
                />
                <button type="button" className="btn btn-secondary" onClick={addNickname}>➕ Agregar</button>
              </div>
            )}
          </div>

          {/* Color */}
          <div className="form-section">
            <h3>🎨 Color de tarjeta</h3>
            <div className="color-picker">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <h3>📝 Descripción</h3>
            <div className="form-group">
              <textarea className="form-textarea" value={form.description} onChange={set('description')} placeholder="Contá algo sobre su personalidad..." />
            </div>
          </div>

          {/* Family */}
          {pets.filter(p => p.id !== id).length > 0 && (
            <div className="form-section">
              <h3>👨‍👩‍👧 Vínculos familiares</h3>
              <div className="form-group">
                <label className="form-label">Padres</label>
                <div className="relation-grid">
                  {pets.filter(p => p.id !== id).map(p => (
                    <button key={p.id} type="button"
                      className={`relation-chip ${form.parents.includes(p.id) ? 'selected' : ''}`}
                      onClick={() => toggleRelation('parents', p.id)}
                    >{p.name}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descendencia</label>
                <div className="relation-grid">
                  {pets.filter(p => p.id !== id).map(p => (
                    <button key={p.id} type="button"
                      className={`relation-chip ${form.offspring.includes(p.id) ? 'selected' : ''}`}
                      onClick={() => toggleRelation('offspring', p.id)}
                    >{p.name}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/pet/${id}`)}>← Cancelar</button>
            <button type="submit" className="btn btn-primary">💾 Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  )
}
