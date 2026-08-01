import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api.js'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate on mount
  useEffect(() => {
    const t = localStorage.getItem('nh_token')
    if (!t) { setLoading(false); return }
    api.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('nh_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { token } = await api.login(email, password)
    localStorage.setItem('nh_token', token)
    const me = await api.me()
    setUser(me)
    return me
  }, [])

  const register = useCallback(async (data) => {
    const { token } = await api.register(data)
    localStorage.setItem('nh_token', token)
    const me = await api.me()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('nh_token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const me = await api.me()
    setUser(me)
    return me
  }, [])

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() { return useContext(Ctx) }
