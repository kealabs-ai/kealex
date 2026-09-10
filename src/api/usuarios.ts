import { api } from './client'
import type { Usuario, Role } from '../types'

export const usuariosApi = {
  list: (role?: Role) => {
    const params = role ? { role } : {}
    return api.get<Usuario[]>('/k1/lex/usuarios', { params }).then((r) => r.data)
  },
  get: (id: string) => api.get<Usuario>(`/k1/lex/usuarios/${id}`).then((r) => r.data),
  create: (data: { nome: string; email: string; senha: string; role: Role }) =>
    api.post<Usuario>('/k1/lex/usuarios', data).then((r) => r.data),
  update: (id: string, data: Partial<Usuario & { senha?: string }>) =>
    api.put<Usuario>(`/k1/lex/usuarios/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/k1/lex/usuarios/${id}`).then((r) => r.data),
}
