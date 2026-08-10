import { useState } from 'react'

export default function WelcomeModal({ onSave }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim())
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: '2rem',
        maxWidth: 400, width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🐾</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Bienvenido/a a PetMemories</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          ¿Con qué nombre querés aparecer en comentarios y anécdotas?
        </p>
        <form onSubmit={handleSubmit}>
          <input
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre o apodo"
            autoFocus
            style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Entrar 🚀
          </button>
        </form>
      </div>
    </div>
  )
}
