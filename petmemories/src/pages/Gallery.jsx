import { Link } from 'react-router-dom'
import './Gallery.css'

const SPECIES_EMOJI = {
  'Perro': '🐕', 'Gato': '🐈', 'Conejo': '🐇', 'Pájaro': '🐦',
  'Pez': '🐠', 'Tortuga': '🐢', 'Hámster': '🐹', 'Otro': '🐾',
}

export default function Gallery({ pets }) {
  const all = pets.flatMap(p =>
    p.anecdotes.filter(a => a.photo).map(a => ({ ...a, petId: p.id, petName: p.name, type: 'anecdote' }))
  )

  return (
    <div className="page gallery-page">
      <div className="container">
        <div className="gallery-header">
          <h1>🖼️ Galería familiar</h1>
          <p>Todas las fotos y avatares de la familia</p>
        </div>

        {/* Pet avatar strip */}
        <div className="gallery-avatars card card-body">
          <h3>🐾 Nuestras mascotas</h3>
          <div className="avatar-strip">
            {pets.map(pet => (
              <Link to={`/pet/${pet.id}`} key={pet.id} className="avatar-strip-item">
                {pet.cartoonAvatar || pet.profilePhoto ? (
                  <img src={pet.cartoonAvatar || pet.profilePhoto} alt={pet.name} className="avatar" style={{ width: 72, height: 72 }} />
                ) : (
                  <div className="avatar-placeholder" style={{ width: 72, height: 72, background: `${pet.color || '#E8875A'}33`, fontSize: '2rem' }}>
                    {SPECIES_EMOJI[pet.species] || '🐾'}
                  </div>
                )}
                <span className="avatar-strip-name">{pet.name}</span>
                {pet.cartoonAvatar && <span className="avatar-strip-ai">✨ IA</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent anecdotes with photos */}
        {all.length > 0 && (
          <section className="gallery-section">
            <h3>📸 Fotos en anécdotas</h3>
            <div className="gallery-grid">
              {all.map(item => (
                <Link to={`/pet/${item.petId}`} key={item.id} className="gallery-item card">
                  <img src={item.photo} alt={item.title} className="gallery-img" />
                  <div className="gallery-item-info card-body">
                    <strong>{item.title}</strong>
                    <span>{item.petName} · {item.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent anecdotes as timeline */}
        <section className="gallery-section">
          <h3>📖 Anécdotas recientes</h3>
          {pets.every(p => p.anecdotes.length === 0) ? (
            <div className="empty-state"><div className="emoji">📖</div><p>Sin anécdotas aún. ¡Empezá a registrar los momentos!</p></div>
          ) : (
            <div className="timeline">
              {pets
                .flatMap(p => p.anecdotes.map(a => ({ ...a, petId: p.id, petName: p.name, petColor: p.color, petSpecies: p.species })))
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 20)
                .map(item => (
                  <Link to={`/pet/${item.petId}`} key={item.id} className="timeline-item">
                    <div className="timeline-dot" style={{ background: item.petColor || 'var(--paw)' }}>
                      {SPECIES_EMOJI[item.petSpecies] || '🐾'}
                    </div>
                    <div className="timeline-content card card-body">
                      <div className="timeline-meta">
                        <strong>{item.petName}</strong>
                        <span className="timeline-date">{item.date}</span>
                      </div>
                      <strong className="timeline-title">{item.title}</strong>
                      <p className="timeline-story">{item.story}</p>
                    </div>
                  </Link>
                ))
              }
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
