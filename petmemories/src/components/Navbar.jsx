import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const { pathname } = useLocation()
  const links = [
    { to: '/', label: 'Inicio', emoji: '🏠' },
    { to: '/tree', label: 'Árbol', emoji: '🌳' },
    { to: '/gallery', label: 'Galería', emoji: '🖼️' },
    { to: '/add', label: 'Agregar', emoji: '➕' },
  ]
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
      </div>
    </nav>
  )
}
