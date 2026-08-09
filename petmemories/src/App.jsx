import { Routes, Route } from 'react-router-dom'
import { usePets } from './hooks/usePets.js'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import PetProfile from './pages/PetProfile.jsx'
import AddPet from './pages/AddPet.jsx'
import FamilyTree from './pages/FamilyTree.jsx'
import Gallery from './pages/Gallery.jsx'

export default function App() {
  const { pets, getPet, addPet, updatePet, deletePet, addComment, addAnecdote, setCartoonAvatar } = usePets()

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home pets={pets} />} />
        <Route path="/pet/:id" element={
          <PetProfile
            pets={pets}
            addComment={addComment}
            addAnecdote={addAnecdote}
            setCartoonAvatar={setCartoonAvatar}
            deletePet={deletePet}
          />
        } />
        <Route path="/add" element={<AddPet pets={pets} addPet={addPet} />} />
        <Route path="/tree" element={<FamilyTree pets={pets} />} />
        <Route path="/gallery" element={<Gallery pets={pets} />} />
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
