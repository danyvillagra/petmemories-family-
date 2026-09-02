import { Link } from 'react-router-dom'
import './PetCard.css'

const SPECIES_EMOJI = {
  'Perro': '🐕', 'Gato': '🐈', 'Conejo': '🐇', 'Pájaro': '🐦',
  'Pez': '🐠', 'Tortuga': '🐢', 'Hámster': '🐹', 'Otro': '🐾',
}

export default function PetCard({ pet }) {
  const emoji = SPECIES_EMOJI[pet.species] || '🐾'
  const isAlive = !pet.deathYear
  const age = isAlive
    ? new Date().getFullYear() - pet.birthYear
    : pet.deathYear - pet.birthYear

  return (
    <Link to={`/pet/${pet.id}`} className="pet-card card fade-in" style={{ '--pet-color': pet.color || '#E8875A' }}>
      <div className="pet-card-header" style={{ background: pet.color ? `${pet.color}22` : '#E8875A22' }}>
        <div className="pet-card-avatar">
          {pet.cartoonAvatar || pet.profilePhoto ? (
            <img
              src={pet.cartoonAvatar || pet.profilePhoto}
              alt={pet.name}
              className="avatar"
              style={{ width: 80, height: 80 }}
            />
          ) : (
            <div className="avatar-placeholder" style={{ width: 80, height: 80, fontSize: '2.4rem' }}>
              {emoji}
            </div>
          )}
          {!isAlive && <span className="memory-ribbon" title="En el recuerdo">🌈</span>}
        </div>
        <div className="pet-card-info">
          <h3 className="pet-card-name">{pet.name}</h3>
          <div className="pet-card-meta">
            <span className="badge badge-species">{pet.species}</span>
            {pet.breed && <span className="pet-breed">{pet.breed}</span>}
          </div>
        </div>
      </div>
      <div className="pet-card-body card-body">
        <p className="pet-desc">{pet.description || 'Sin descripción aún.'}</p>
        <div className="pet-card-stats">
          <div className="pet-stat">
            <span className="stat-emoji">🎂</span>
            <span>{pet.birthYear}</span>
          </div>
          <div className="pet-stat">
            <span className="stat-emoji">⏳</span>
            <span>{age} {age === 1 ? 'año' : 'años'}</span>
          </div>
          <div className="pet-stat">
            <span className="stat-emoji">💬</span>
            <span>{pet.comments.length}</span>
          </div>
          {pet.offspring.length > 0 && (
            <div className="pet-stat">
              <span className="stat-emoji">🐣</span>
              <span>{pet.offspring.length}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
