import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import initialData from '../data/pets.json'

const STORAGE_KEY = 'petmemories_data'

export function usePets() {
  const [pets, setPets] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : initialData
    } catch {
      return initialData
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets))
  }, [pets])

  const getPet = useCallback((id) => pets.find(p => p.id === id), [pets])

  const addPet = useCallback((petData) => {
    const newPet = {
      id: `pet-${uuidv4().slice(0, 8)}`,
      comments: [],
      anecdotes: [],
      gallery: [],
      addedBy: 'familia',
      lastModified: new Date().toISOString().slice(0, 10),
      ...petData,
    }
    setPets(prev => [...prev, newPet])
    return newPet.id
  }, [])

  const updatePet = useCallback((id, updates) => {
    setPets(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, lastModified: new Date().toISOString().slice(0, 10) } : p
    ))
  }, [])

  const deletePet = useCallback((id) => {
    setPets(prev => prev
      .filter(p => p.id !== id)
      .map(p => ({
        ...p,
        parents: p.parents.filter(pid => pid !== id),
        offspring: p.offspring.filter(oid => oid !== id),
      }))
    )
  }, [])

  const addComment = useCallback((petId, text, author) => {
    const comment = {
      id: `c-${uuidv4().slice(0, 8)}`,
      author,
      date: new Date().toISOString().slice(0, 10),
      text,
    }
    setPets(prev => prev.map(p =>
      p.id === petId ? { ...p, comments: [...p.comments, comment] } : p
    ))
  }, [])

  const addAnecdote = useCallback((petId, anecdote) => {
    const newAnecdote = {
      id: `a-${uuidv4().slice(0, 8)}`,
      date: new Date().toISOString().slice(0, 10),
      ...anecdote,
    }
    setPets(prev => prev.map(p =>
      p.id === petId ? { ...p, anecdotes: [...p.anecdotes, newAnecdote] } : p
    ))
  }, [])

  const setCartoonAvatar = useCallback((petId, avatarDataUrl) => {
    setPets(prev => prev.map(p =>
      p.id === petId ? { ...p, cartoonAvatar: avatarDataUrl } : p
    ))
  }, [])

  const addPhoto = useCallback((petId, dataUrl, caption = '') => {
    const photo = {
      id: `ph-${uuidv4().slice(0, 8)}`,
      url: dataUrl,
      caption,
      date: new Date().toISOString().slice(0, 10),
    }
    setPets(prev => prev.map(p =>
      p.id === petId ? { ...p, gallery: [...(p.gallery || []), photo] } : p
    ))
  }, [])

  const exportPet = useCallback((petId) => {
    const pet = pets.find(p => p.id === petId)
    if (!pet) return
    const json = JSON.stringify(pet, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pet.name.toLowerCase().replace(/\s+/g, '-')}-petmemories.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [pets])

  const importPet = useCallback((jsonString) => {
    const data = JSON.parse(jsonString)
    if (!data.name || !data.species) throw new Error('Invalid pet data')
    const newPet = {
      ...data,
      id: `pet-${uuidv4().slice(0, 8)}`,
      parents: [],
      offspring: [],
      lastModified: new Date().toISOString().slice(0, 10),
    }
    setPets(prev => [...prev, newPet])
    return newPet
  }, [])

  return {
    pets,
    getPet,
    addPet,
    updatePet,
    deletePet,
    addComment,
    addAnecdote,
    setCartoonAvatar,
    addPhoto,
    exportPet,
    importPet,
  }
}
