import { api } from './client'
import type { AuthUser } from '../types'

export const authApi = {
  login: (email: string, senha: string) =>
    api.post<AuthUser>('/k1/lex/auth/login', { email, senha }).then((r) => r.data),

  register: (data: { nome: string; email: string; whatsapp: string; perfil: string; senha: string }) =>
    api.post<AuthUser>('/k1/lex/auth/register', data).then((r) => r.data),
}
