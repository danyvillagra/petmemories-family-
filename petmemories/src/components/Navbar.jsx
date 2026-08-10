import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ username, onChangeName }) {
  const { pathname } = useLocation()
  const links = [
    { to: '/', label: 'Inicio', emoji: '🏠' },
    { to: '/tree', label: 'Árbol', emoji: '🌳' },
    { to: '/gallery', label: 'Galería', emoji: '🖼️' },
    { to: '/add', label: 'Agregar', emoji: '➕' },
    { to: '/import', label: 'Importar', emoji: '📥' },
  ]

  const handleChangeName = () => {
    const newName = prompt('¿Cómo querés llamarte?', username)
    if (newName && newName.trim()) onChangeName(newName.trim())
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-paw">🐾</span>
        <span className="navbar-title">PetMemories</span>
        <span className="navbar-sub">Family</span>
      </Link>
      <div className="navbar-links">
        {links.map(({ to, label, emoji }) => (
          <Link
            key={to}
            to={to}
            className={`navbar-link ${pathname === to ? 'active' : ''}`}
          >
            <span className="nav-emoji">{emoji}</span>
            <span className="nav-label">{label}</span>
          </Link>
        ))}
        {username && (
          <button
            onClick={handleChangeName}
            className="navbar-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            title="Cambiar nombre"
          >
            <span className="nav-emoji">👤</span>
            <span className="nav-label">{username}</span>
          </button>
        )}
      </div>
    </nav>
  )
}
