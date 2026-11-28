import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './auth-context'
import type { AuthUser } from '../types'
import { clearStoredSession, isTokenValid, readAccessToken, restoreStoredSession, saveAccessToken, saveUserProfile } from '../utils/authSessionStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(restoreStoredSession)

  const login = (u: AuthUser) => {
    queryClient.clear()
    clearStoredSession()
    try {
      saveUserProfile(u)
      saveAccessToken(u.accessToken)
      setUser(u)
    } catch (error) {
      clearStoredSession()
      setUser(null)
      throw error
    }
  }

  const logout = useCallback(() => {
    queryClient.clear()
    clearStoredSession()
    setUser(null)
  }, [queryClient])

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...partial }
      saveUserProfile(updated)
      return updated
    })
  }

  // verifica expiração a cada minuto e ao focar a janela
  useEffect(() => {
    const check = () => {
      try {
        const token = readAccessToken()
        if ((!token && user) || (token && !isTokenValid(token))) logout()
      } catch {
        logout()
      }
    }
    check()
    const interval = setInterval(check, 60_000)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', check)
    }
  }, [logout, user])

  useEffect(() => {
    const synchronizeSession = (event: StorageEvent) => {
      if (event.key !== null && event.key !== 'kealex_token' && event.key !== 'kealex_user') return
      const restored = restoreStoredSession()
      queryClient.clear()
      setUser(restored)
    }
    window.addEventListener('storage', synchronizeSession)
    return () => window.removeEventListener('storage', synchronizeSession)
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
