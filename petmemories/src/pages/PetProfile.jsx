import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './PetProfile.css'

const SPECIES_EMOJI = {
  'Perro': '🐕', 'Gato': '🐈', 'Conejo': '🐇', 'Pájaro': '🐦',
  'Pez': '🐠', 'Tortuga': '🐢', 'Hámster': '🐹', 'Otro': '🐾',
}

export default function PetProfile({ pets, username, addComment, addAnecdote, setCartoonAvatar, deletePet, addPhoto, exportPet, updatePet }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const pet = pets.find(p => p.id === id)
  const profilePhotoInputRef = useRef()

  const [commentText, setCommentText] = useState('')
  const [anecdoteTitle, setAnecdoteTitle] = useState('')
  const [anecdoteStory, setAnecdoteStory] = useState('')
  const [anecdotePhoto, setAnecdotePhoto] = useState(null)
  const [showAnecdoteForm, setShowAnecdoteForm] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [generatingAvatar, setGeneratingAvatar] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [lightboxSrc, setLightboxSrc] = useState(null)

  if (!pet) return (
    <div className="page container">
      <div className="empty-state"><div className="emoji">🔍</div><h2>Mascota no encontrada</h2></div>
    </div>
  )

  const emoji = SPECIES_EMOJI[pet.species] || '🐾'
  const isAlive = !pet.deathYear
  const age = isAlive
    ? new Date().getFullYear() - pet.birthYear
    : pet.deathYear - pet.birthYear

  const parents = pet.parents.map(pid => pets.find(p => p.id === pid)).filter(Boolean)
  const offspring = pet.offspring.map(oid => pets.find(p => p.id === oid)).filter(Boolean)

  const handleComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    addComment(pet.id, commentText, username || 'Anónimo')
    setCommentText('')
  }

  const handleAnecdote = (e) => {
    e.preventDefault()
    if (!anecdoteTitle.trim() || !anecdoteStory.trim()) return
    addAnecdote(pet.id, {
      title: anecdoteTitle,
      story: anecdoteStory,
      photo: anecdotePhoto,
      author: username || 'Anónimo',
    })
    setAnecdoteTitle('')
    setAnecdoteStory('')
    setAnecdotePhoto(null)
    setShowAnecdoteForm(false)
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setUploadedPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleAnecdotePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAnecdotePhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleAddPhoto = () => {
    if (!uploadedPhoto) return
    addPhoto(pet.id, uploadedPhoto, photoCaption)
    setUploadedPhoto(null)
    setPhotoCaption('')
  }

  const handleGenerateAvatar = async () => {
    if (!uploadedPhoto) return
    setGeneratingAvatar(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: uploadedPhoto.split(',')[1] }
              },
              {
                type: 'text',
                text: `Describí esta mascota en detalle para que un artista pueda crear una versión anime/cartoon de ella. Describí: especie, color de pelaje/plumas, rasgos faciales distintivos, tamaño aproximado, expresión y personalidad que transmite la foto. Sé específico sobre colores y características únicas. Responde solo con la descripción, sin saludos.`
              }
            ]
          }]
        })
      })
      const data = await response.json()
      const description = data.content?.[0]?.text || ''
      alert(`📋 Descripción generada para el artista:\n\n${description}\n\n💡 Próximamente: generación automática de avatar. Por ahora podés usar esta descripción en Midjourney, DALL-E o similar con el estilo "anime cartoon pet portrait".`)
    } catch (err) {
      alert('Error al conectar con la IA. Verificá tu conexión.')
    }
    setGeneratingAvatar(false)
  }

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxW = 400
      const ratio = Math.min(1, maxW / img.width)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      updatePet(pet.id, { profilePhoto: canvas.toDataURL('image/jpeg', 0.8) })
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const handleDelete = () => {
    if (confirm(`¿Eliminar a ${pet.name}? Esta acción no se puede deshacer.`)) {
      deletePet(pet.id)
      navigate('/')
    }
  }

  const gallery = pet.gallery || []

  return (
    <div className="page profile-page">
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, cursor: 'zoom-out',
          }}
        >
          <img src={lightboxSrc} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
        </div>
      )}

      <div className="container">
        {/* Header */}
        <div className="profile-header card fade-in" style={{ '--pet-color': pet.color || '#E8875A' }}>
          <div className="profile-header-bg" style={{ background: `linear-gradient(135deg, ${pet.color || '#E8875A'}33 0%, ${pet.color || '#E8875A'}11 100%)` }} />
          <div className="profile-header-content">
            <div className="profile-avatar-wrap" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => profilePhotoInputRef.current.click()} title="Cambiar foto de perfil">
              {pet.cartoonAvatar || pet.profilePhoto ? (
                <img src={pet.cartoonAvatar || pet.profilePhoto} alt={pet.name} className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">{emoji}</div>
              )}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ fontSize: '1.4rem' }}>📷</span>
              </div>
              {!isAlive && <span className="profile-rainbow">🌈</span>}
              <input ref={profilePhotoInputRef} type="file" accept="image/*" capture="environment" onChange={handleProfilePhoto} style={{ display: 'none' }} />
            </div>
            <div className="profile-meta">
              <div className="profile-name-row">
                <h1 className="profile-name">{pet.name}</h1>
                <span className={`badge ${isAlive ? 'badge-alive' : 'badge-memory'}`}>
                  {isAlive ? '❤️ Activo' : '🌈 En el recuerdo'}
                </span>
              </div>
              {pet.nicknames && pet.nicknames.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  {pet.nicknames.map(nick => (
                    <span key={nick} style={{
                      background: `${pet.color || '#E8875A'}33`,
                      color: 'var(--text-muted)', borderRadius: 20,
                      padding: '0.15rem 0.65rem', fontSize: '0.82rem', fontStyle: 'italic',
                    }}>"{nick}"</span>
                  ))}
                </div>
              )}
              <div className="profile-tags">
                <span className="badge badge-species">{pet.species}</span>
                {pet.breed && <span className="profile-breed">{pet.breed}</span>}
                {pet.gender && <span className="badge badge-species">{pet.gender === 'macho' ? '♂ Macho' : '♀ Hembra'}</span>}
              </div>
              <div className="profile-vitals">
                <div className="vital"><span>🎂</span><strong>{pet.birthYear}</strong><span>nacimiento</span></div>
                {pet.deathYear && <div className="vital"><span>🕊️</span><strong>{pet.deathYear}</strong><span>partida</span></div>}
                <div className="vital"><span>⏳</span><strong>{age}</strong><span>{age === 1 ? 'año' : 'años'}</span></div>
                <div className="vital"><span>📷</span><strong>{gallery.length}</strong><span>fotos</span></div>
                <div className="vital"><span>💬</span><strong>{pet.comments.length}</strong><span>comentarios</span></div>
                <div className="vital"><span>📖</span><strong>{pet.anecdotes.length}</strong><span>anécdotas</span></div>
              </div>
              {pet.description && <p className="profile-desc">{pet.description}</p>}
            </div>
          </div>
          <div className="profile-header-actions">
            <Link to={`/edit/${pet.id}`} className="btn btn-secondary btn-sm">✏️ Editar</Link>
            <button onClick={() => exportPet(pet.id)} className="btn btn-secondary btn-sm">📤 Exportar</button>
            <button onClick={handleDelete} className="btn btn-sm" style={{ background: '#FEE2E2', color: '#991B1B', borderColor: '#FCA5A5' }}>🗑️ Eliminar</button>
          </div>
        </div>

        {/* Family links */}
        {(parents.length > 0 || offspring.length > 0) && (
          <div className="family-strip card fade-in">
            <div className="card-body" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {parents.length > 0 && (
                <div className="family-group">
                  <span className="family-label">👨‍👩‍👧 Padres</span>
                  <div className="family-avatars">
                    {parents.map(p => (
                      <Link key={p.id} to={`/pet/${p.id}`} className="family-chip">
                        <div className="family-chip-avatar">{SPECIES_EMOJI[p.species] || '🐾'}</div>
                        <span>{p.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {offspring.length > 0 && (
                <div className="family-group">
                  <span className="family-label">🐣 Descendencia</span>
                  <div className="family-avatars">
                    {offspring.map(p => (
                      <Link key={p.id} to={`/pet/${p.id}`} className="family-chip">
                        <div className="family-chip-avatar">{SPECIES_EMOJI[p.species] || '🐾'}</div>
                        <span>{p.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="profile-tabs">
          {['info', 'photos', 'anecdotes', 'comments', 'avatar'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'info' && '📋 Info'}
              {tab === 'photos' && `📷 Fotos (${gallery.length})`}
              {tab === 'anecdotes' && `📖 Anécdotas (${pet.anecdotes.length})`}
              {tab === 'comments' && `💬 Comentarios (${pet.comments.length})`}
              {tab === 'avatar' && '🎨 Avatar IA'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="tab-content fade-in" key={activeTab}>

          {activeTab === 'info' && (
            <div className="card card-body">
              <h3>📋 Información</h3>
              <div className="info-grid">
                <div className="info-item"><span className="info-label">Nombre</span><span>{pet.name}</span></div>
                <div className="info-item"><span className="info-label">Especie</span><span>{pet.species}</span></div>
                {pet.breed && <div className="info-item"><span className="info-label">Raza</span><span>{pet.breed}</span></div>}
                <div className="info-item"><span className="info-label">Año de nacimiento</span><span>{pet.birthYear}</span></div>
                {pet.deathYear && <div className="info-item"><span className="info-label">Año de partida</span><span>{pet.deathYear}</span></div>}
                {pet.gender && <div className="info-item"><span className="info-label">Género</span><span>{pet.gender}</span></div>}
                <div className="info-item"><span className="info-label">Agregado por</span><span>{pet.addedBy}</span></div>
              </div>
              {pet.description && (
                <>
                  <h3 style={{ marginTop: '1.5rem' }}>📝 Descripción</h3>
                  <p style={{ marginTop: '0.5rem' }}>{pet.description}</p>
                </>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div>
              {/* Upload form */}
              <div className="card card-body" style={{ marginBottom: '1rem' }}>
                <h3>📷 Agregar foto</h3>
                <div style={{ marginTop: '1rem' }}>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="form-input"
                  />
                  {uploadedPhoto && (
                    <>
                      <img src={uploadedPhoto} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginTop: '0.75rem' }} />
                      <input
                        className="form-input"
                        style={{ marginTop: '0.75rem' }}
                        placeholder="Descripción (opcional)"
                        value={photoCaption}
                        onChange={e => setPhotoCaption(e.target.value)}
                      />
                      <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={handleAddPhoto}>
                        💾 Guardar foto
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Gallery grid */}
              {gallery.length === 0 ? (
                <div className="empty-state"><div className="emoji">📷</div><p>Todavía no hay fotos. ¡Subí la primera!</p></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                  {[...gallery].reverse().map(ph => (
                    <div key={ph.id} style={{ borderRadius: 8, overflow: 'hidden', cursor: 'zoom-in', position: 'relative' }} onClick={() => setLightboxSrc(ph.url)}>
                      <img src={ph.url} alt={ph.caption} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                      {ph.caption && (
                        <div style={{ padding: '0.4rem 0.5rem', background: 'var(--surface)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ph.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'anecdotes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setShowAnecdoteForm(v => !v)}>
                  {showAnecdoteForm ? '✕ Cancelar' : '➕ Nueva anécdota'}
                </button>
              </div>
              {showAnecdoteForm && (
                <form onSubmit={handleAnecdote} className="card card-body" style={{ marginBottom: '1rem' }}>
                  <h3>📖 Nueva anécdota — <span style={{ color: 'var(--primary)', fontSize: '0.9em' }}>{username || 'Anónimo'}</span></h3>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Título</label>
                    <input className="form-input" value={anecdoteTitle} onChange={e => setAnecdoteTitle(e.target.value)} placeholder="Ej: El gran escape" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Historia</label>
                    <textarea className="form-textarea" value={anecdoteStory} onChange={e => setAnecdoteStory(e.target.value)} placeholder="Contá lo que pasó..." required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Foto (opcional)</label>
                    <input type="file" accept="image/*" capture="environment" onChange={handleAnecdotePhotoUpload} className="form-input" />
                    {anecdotePhoto && <img src={anecdotePhoto} alt="" style={{ marginTop: '0.5rem', width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }} />}
                  </div>
                  <button type="submit" className="btn btn-primary">💾 Guardar anécdota</button>
                </form>
              )}
              {pet.anecdotes.length === 0 ? (
                <div className="empty-state"><div className="emoji">📖</div><p>Todavía no hay anécdotas. ¡Agregá la primera!</p></div>
              ) : (
                <div className="anecdotes-list">
                  {[...pet.anecdotes].reverse().map(a => (
                    <div key={a.id} className="anecdote-card card card-body">
                      <div className="anecdote-header">
                        <h3>{a.title}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {a.author && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>✍️ {a.author}</span>}
                          <span className="anecdote-date">{a.date}</span>
                        </div>
                      </div>
                      <p style={{ marginTop: '0.5rem' }}>{a.story}</p>
                      {a.photo && <img src={a.photo} alt="" style={{ marginTop: '0.75rem', width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }} onClick={() => setLightboxSrc(a.photo)} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <form onSubmit={handleComment} className="card card-body" style={{ marginBottom: '1rem' }}>
                <h3>💬 Comentar como <span style={{ color: 'var(--primary)' }}>{username || 'Anónimo'}</span></h3>
                <div className="comment-form-row" style={{ marginTop: '1rem' }}>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Escribí un recuerdo o comentario..."
                    required
                  />
                  <button type="submit" className="btn btn-primary">Enviar</button>
                </div>
              </form>
              {pet.comments.length === 0 ? (
                <div className="empty-state"><div className="emoji">💬</div><p>Sin comentarios aún. ¡Sé el primero!</p></div>
              ) : (
                <div className="comments-list">
                  {[...pet.comments].reverse().map(c => (
                    <div key={c.id} className="comment-item card card-body">
                      <div className="comment-header">
                        <div className="comment-author-avatar">{c.author[0].toUpperCase()}</div>
                        <strong>{c.author}</strong>
                        <span className="comment-date">{c.date}</span>
                      </div>
                      <p style={{ marginTop: '0.5rem', marginLeft: '2.8rem' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'avatar' && (
            <div className="card card-body avatar-tab">
              <h3>🎨 Generar avatar cartoon con IA</h3>
              <p style={{ margin: '0.5rem 0 1.5rem' }}>Subí una foto de {pet.name} y la IA generará una descripción para crear su avatar estilo anime.</p>
              <div className="avatar-upload-area">
                {uploadedPhoto ? (
                  <img src={uploadedPhoto} alt="Foto subida" className="avatar-preview" />
                ) : (
                  <div className="avatar-upload-placeholder">
                    <span style={{ fontSize: '3rem' }}>📷</span>
                    <p>Subí una foto de {pet.name}</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="form-input" style={{ marginTop: '1rem' }} />
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
                onClick={handleGenerateAvatar}
                disabled={!uploadedPhoto || generatingAvatar}
              >
                {generatingAvatar ? '⏳ Analizando...' : '✨ Generar descripción IA'}
              </button>
              {pet.cartoonAvatar && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3>Avatar actual</h3>
                  <img src={pet.cartoonAvatar} alt="Avatar" style={{ width: 120, height: 120, borderRadius: '50%', marginTop: '0.5rem', border: '3px solid var(--border)' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
