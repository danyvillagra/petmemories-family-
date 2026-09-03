import { useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

// ── Configuración GitHub ──────────────────────────────────────────
const OWNER = 'danyvillagra'
const REPO  = 'petmemories-family-'
const FILE  = 'public/pets.json'
const BRANCH = 'main'
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN

const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE}`
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`

// ── Helpers GitHub API ────────────────────────────────────────────
async function fetchPetsFromGitHub() {
  // Cache-busting para siempre obtener datos frescos
  const res = await fetch(`${RAW_URL}?t=${Date.now()}`)
  if (!res.ok) throw new Error('No se pudo cargar pets.json desde GitHub')
  return res.json()
}

async function savePetsToGitHub(pets, currentSha) {
  if (!TOKEN) {
    console.warn('VITE_GITHUB_TOKEN no configurado — cambios solo locales')
    return null
  }
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(pets, null, 2))))
  const body = {
    message: `🐾 Actualización mascotas [${new Date().toLocaleString('es-PY')}]`,
    content,
    sha: currentSha,
    branch: BRANCH,
  }
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Error guardando en GitHub')
  }
  const data = await res.json()
  return data.content.sha  // SHA actualizado para próximos commits
}

async function getFileSha() {
  const res = await fetch(API_URL, {
    headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {},
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.sha
}

// ── Hook principal ────────────────────────────────────────────────
export function usePets() {
  const [pets, setPets]       = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const shaRef = useRef(null)          // SHA del archivo en GitHub
  const pendingRef = useRef(null)      // Debounce de guardado

  // Carga inicial desde GitHub
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [data, sha] = await Promise.all([
          fetchPetsFromGitHub(),
          getFileSha(),
        ])
        setPets(data)
        shaRef.current = sha
      } catch (e) {
        setError('No se pudo cargar los datos. Verificá tu conexión.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Guarda en GitHub con debounce de 1.5s para no hacer un commit por tecla
  const persist = useCallback((newPets) => {
    if (pendingRef.current) clearTimeout(pendingRef.current)
    pendingRef.current = setTimeout(async () => {
      try {
        setSaving(true)
        const newSha = await savePetsToGitHub(newPets, shaRef.current)
        if (newSha) shaRef.current = newSha
      } catch (e) {
        setError(`Error al guardar: ${e.message}`)
        console.error(e)
      } finally {
        setSaving(false)
      }
    }, 1500)
  }, [])

  // Wrapper que actualiza estado local Y persiste en GitHub
  const updateAndPersist = useCallback((updater) => {
    setPets(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next)
      return next
    })
  }, [persist])

  // ── API pública del hook (misma interfaz que antes) ───────────
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
    updateAndPersist(prev => [...prev, newPet])
    return newPet.id
  }, [updateAndPersist])

  const updatePet = useCallback((id, updates) => {
    updateAndPersist(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, lastModified: new Date().toISOString().slice(0, 10) } : p
    ))
  }, [updateAndPersist])

  const deletePet = useCallback((id) => {
    updateAndPersist(prev => prev
      .filter(p => p.id !== id)
      .map(p => ({
        ...p,
        parents: p.parents.filter(pid => pid !== id),
        offspring: p.offspring.filter(oid => oid !== id),
      }))
    )
  }, [updateAndPersist])

  const addComment = useCallback((petId, text, author) => {
    const comment = {
      id: `c-${uuidv4().slice(0, 8)}`,
      author,
      date: new Date().toISOString().slice(0, 10),
      text,
    }
    updateAndPersist(prev => prev.map(p =>
      p.id === petId ? { ...p, comments: [...p.comments, comment] } : p
    ))
  }, [updateAndPersist])

  const addAnecdote = useCallback((petId, anecdote) => {
    const newAnecdote = {
      id: `a-${uuidv4().slice(0, 8)}`,
      date: new Date().toISOString().slice(0, 10),
      ...anecdote,
    }
    updateAndPersist(prev => prev.map(p =>
      p.id === petId ? { ...p, anecdotes: [...p.anecdotes, newAnecdote] } : p
    ))
  }, [updateAndPersist])

  const setCartoonAvatar = useCallback((petId, avatarDataUrl) => {
    updateAndPersist(prev => prev.map(p =>
      p.id === petId ? { ...p, cartoonAvatar: avatarDataUrl } : p
    ))
  }, [updateAndPersist])

  const addPhoto = useCallback((petId, dataUrl, caption = '') => {
    const photo = {
      id: `ph-${uuidv4().slice(0, 8)}`,
      url: dataUrl,
      caption,
      date: new Date().toISOString().slice(0, 10),
    }
    updateAndPersist(prev => prev.map(p =>
      p.id === petId ? { ...p, gallery: [...(p.gallery || []), photo] } : p
    ))
  }, [updateAndPersist])

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
    updateAndPersist(prev => [...prev, newPet])
    return newPet
  }, [updateAndPersist])

  return {
    pets,
    loading,
    saving,
    error,
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
