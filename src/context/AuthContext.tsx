import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthUser, Role } from '../types'

interface AuthContextType {
  user: AuthUser | null
  role: Role | null
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function restoreSession(): AuthUser | null {
  try {
    const token = localStorage.getItem('kealex_token')
    const stored = localStorage.getItem('kealex_user')
    if (!token || !stored) return null
    if (!isTokenValid(token)) {
      localStorage.removeItem('kealex_token')
      localStorage.removeItem('kealex_user')
      return null
    }
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(restoreSession)

  const login = (u: AuthUser) => {
    localStorage.setItem('kealex_token', u.accessToken)
    localStorage.setItem('kealex_user', JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('kealex_token')
    localStorage.removeItem('kealex_user')
    setUser(null)
  }

  // verifica expiração a cada minuto e ao focar a janela
  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem('kealex_token')
      if (token && !isTokenValid(token)) logout()
    }
    check()
    const interval = setInterval(check, 60_000)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', check)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
