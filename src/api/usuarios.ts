import { api } from './client'
import type { Usuario, Role } from '../types'

export const usuariosApi = {
  list: (role?: Role) =>
    api.get<Usuario[]>('/usuarios', { params: role ? { role } : {} }).then((r) => r.data),
  get: (id: string) => api.get<Usuario>(`/usuarios/${id}`).then((r) => r.data),
  create: (data: { nome: string; email: string; senha: string; role: Role }) =>
    api.post<Usuario>('/usuarios', data).then((r) => r.data),
  update: (id: string, data: Partial<Usuario & { senha?: string }>) =>
    api.patch<Usuario>(`/usuarios/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/usuarios/${id}`).then((r) => r.data),
}
