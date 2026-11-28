import { createContext } from 'react'
import type { AuthUser, Role } from '../types'

export interface AuthContextType {
  user: AuthUser | null
  role: Role | null
  login: (user: AuthUser) => void
  logout: () => void
  updateUser: (partial: Partial<AuthUser>) => void
}

export const AuthContext = createContext<AuthContextType>(null!)
