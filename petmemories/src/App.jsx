import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { usePets } from './hooks/usePets.js'
import { useUser } from './hooks/useUser.js'
import Navbar from './components/Navbar.jsx'
import WelcomeModal from './components/WelcomeModal.jsx'
import Home from './pages/Home.jsx'
import PetProfile from './pages/PetProfile.jsx'
import AddPet from './pages/AddPet.jsx'
import FamilyTree from './pages/FamilyTree.jsx'
import Gallery from './pages/Gallery.jsx'

function ImportPage({ importPet }) {
  const [status, setStatus] = useState(null)
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const result = importPet(ev.target.result)
        setStatus({ ok: true, name: result.name })
      } catch {
        setStatus({ ok: false })
      }
    }
    reader.readAsText(file)
  }
  return (
    <div className="page container" style={{ maxWidth: 500, paddingTop: '3rem' }}>
      <div className="card card-body" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>📥</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Importar mascota</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Seleccioná un archivo .json exportado desde otra app PetMemories
        </p>
        <input type="file" accept=".json" onChange={handleFile} className="form-input" />
        {status?.ok && <p style={{ color: 'green', marginTop: '1rem' }}>✅ {status.name} importada correctamente</p>}
        {status?.ok === false && <p style={{ color: 'red', marginTop: '1rem' }}>❌ Archivo inválido</p>}
      </div>
    </div>
  )
}

export default function App() {
  const { pets, addPet, deletePet, addComment, addAnecdote, setCartoonAvatar, addPhoto, exportPet, importPet } = usePets()
  const { username, saveUsername } = useUser()

  return (
    <>
      {!username && <WelcomeModal onSave={saveUsername} />}
      <Navbar username={username} onChangeName={saveUsername} />
      <Routes>
        <Route path="/" element={<Home pets={pets} />} />
        <Route path="/pet/:id" element={
          <PetProfile
            pets={pets}
            username={username}
            addComment={addComment}
            addAnecdote={addAnecdote}
            setCartoonAvatar={setCartoonAvatar}
            deletePet={deletePet}
            addPhoto={addPhoto}
            exportPet={exportPet}
          />
        } />
        <Route path="/add" element={<AddPet pets={pets} addPet={addPet} username={username} />} />
        <Route path="/tree" element={<FamilyTree pets={pets} />} />
        <Route path="/gallery" element={<Gallery pets={pets} />} />
        <Route path="/import" element={<ImportPage importPet={importPet} />} />
        <Route path="*" element={
          <div className="page container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <div style={{ fontSize: '4rem' }}>🐾</div>
            <h2>Página no encontrada</h2>
          </div>
        } />
      </Routes>
    </>
  )
}
