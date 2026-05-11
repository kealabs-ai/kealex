import { api } from './client'
import type { Usuario, Role } from '../types'

export const usuariosApi = {
  list: (role?: Role) =>
    api.post<Usuario[]>('/usuarios/list', { role }).then((r) => r.data),
  get: (id: string) => api.post<Usuario>('/usuarios/get', { id }).then((r) => r.data),
  create: (data: { nome: string; email: string; senha: string; role: Role }) =>
    api.post<Usuario>('/usuarios', data).then((r) => r.data),
  update: (id: string, data: Partial<Usuario & { senha?: string }>) =>
    api.post<Usuario>('/usuarios/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/usuarios/delete', { id }).then((r) => r.data),
}
