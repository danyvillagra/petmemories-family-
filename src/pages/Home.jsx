import { Link } from 'react-router-dom'
import PetCard from '../components/PetCard.jsx'
import './Home.css'

export default function Home({ pets }) {
  const alive = pets.filter(p => !p.deathYear)
  const memories = pets.filter(p => p.deathYear)

  return (
    <div className="page home-page">
      <div className="container">
        {/* Hero */}
        <div className="home-hero fade-in">
          <div className="home-hero-text">
            <h1 className="home-title">
              Nuestra familia<br />
              <span className="home-title-accent">de mascotas</span>
            </h1>
            <p className="home-subtitle">
              Un lugar para guardar los recuerdos, anécdotas y momentos especiales
              de todas nuestras mascotas 🐾
            </p>
            <div className="home-actions">
              <Link to="/add" className="btn btn-primary">➕ Agregar mascota</Link>
              <Link to="/tree" className="btn btn-secondary">🌳 Ver árbol familiar</Link>
            </div>
          </div>
          <div className="home-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{pets.length}</span>
              <span className="hero-stat-label">mascotas</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">{pets.reduce((a, p) => a + p.comments.length, 0)}</span>
              <span className="hero-stat-label">recuerdos</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">{pets.reduce((a, p) => a + p.anecdotes.length, 0)}</span>
              <span className="hero-stat-label">anécdotas</span>
            </div>
          </div>
        </div>

        {/* Active pets */}
        {alive.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>🐾 Nuestras mascotas</h2>
              <span className="section-count">{alive.length}</span>
            </div>
            <div className="pets-grid">
              {alive.map(pet => <PetCard key={pet.id} pet={pet} />)}
            </div>
          </section>
        )}

        {/* Memory pets */}
        {memories.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>🌈 En el recuerdo</h2>
              <span className="section-count">{memories.length}</span>
            </div>
            <div className="pets-grid">
              {memories.map(pet => <PetCard key={pet.id} pet={pet} />)}
            </div>
          </section>
        )}

        {pets.length === 0 && (
          <div className="empty-state">
            <div className="emoji">🐾</div>
            <h2>¡Aún no hay mascotas!</h2>
            <p>Empezá agregando la primera mascota de la familia.</p>
            <br />
            <Link to="/add" className="btn btn-primary">➕ Agregar mascota</Link>
          </div>
        )}
      </div>
    </div>
  )
}
