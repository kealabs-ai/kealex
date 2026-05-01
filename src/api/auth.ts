import { api } from './client'
import type { AuthUser } from '../types'

export const authApi = {
  login: (email: string, senha: string) =>
    api.post<AuthUser>('/auth/login', { email, senha }).then((r) => r.data),
}
