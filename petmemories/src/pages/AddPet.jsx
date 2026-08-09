import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddPet.css'

const SPECIES = ['Perro', 'Gato', 'Conejo', 'Pájaro', 'Pez', 'Tortuga', 'Hámster', 'Otro']
const COLORS = ['#E8875A', '#6AAF7B', '#7AB8D4', '#A98FCC', '#F2C14E', '#1F2937', '#8B6344', '#E07070']

export default function AddPet({ pets, addPet }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', species: 'Perro', breed: '', gender: 'macho',
    birthYear: new Date().getFullYear(), deathYear: '', color: COLORS[0],
    description: '', parents: [], offspring: [],
  })

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const toggleRelation = (field, id) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id)
        ? f[field].filter(x => x !== id)
        : [...f[field], id]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newId = addPet({
      ...form,
      birthYear: parseInt(form.birthYear),
      deathYear: form.deathYear ? parseInt(form.deathYear) : null,
    })
    navigate(`/pet/${newId}`)
  }

  return (
    <div className="page add-page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="add-header">
          <h1>🐾 Nueva mascota</h1>
          <p>Completá la ficha de tu mascota para guardarla en la familia.</p>
        </div>

        <form onSubmit={handleSubmit} className="add-form card card-body">

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
              <textarea className="form-textarea" value={form.description} onChange={set('description')} placeholder="Contá algo sobre su personalidad, lo que más le gusta, sus características especiales..." />
            </div>
          </div>

          {/* Family */}
          {pets.length > 0 && (
            <div className="form-section">
              <h3>👨‍👩‍👧 Vínculos familiares</h3>
              <div className="form-group">
                <label className="form-label">Padres</label>
                <div className="relation-grid">
                  {pets.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`relation-chip ${form.parents.includes(p.id) ? 'selected' : ''}`}
                      onClick={() => toggleRelation('parents', p.id)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descendencia</label>
                <div className="relation-grid">
                  {pets.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`relation-chip ${form.offspring.includes(p.id) ? 'selected' : ''}`}
                      onClick={() => toggleRelation('offspring', p.id)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>← Cancelar</button>
            <button type="submit" className="btn btn-primary">💾 Guardar mascota</button>
          </div>
        </form>
      </div>
    </div>
  )
}
