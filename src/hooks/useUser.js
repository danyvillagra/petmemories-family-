import { useState } from 'react'

const USER_KEY = 'petmemories_username'

export function useUser() {
  const [username, setUsername] = useState(() => localStorage.getItem(USER_KEY) || '')

  const saveUsername = (name) => {
    const trimmed = name.trim()
    localStorage.setItem(USER_KEY, trimmed)
    setUsername(trimmed)
  }

  return { username, saveUsername }
}
