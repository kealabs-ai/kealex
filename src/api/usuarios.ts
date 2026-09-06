import { api } from './client'
import type { Usuario, Role } from '../types'

export const usuariosApi = {
  list: (role?: Role) =>
    api.post<Usuario[]>('/k1/lex/usuarios/list', { role }).then((r) => r.data),
  get: (id: string) => api.post<Usuario>('/k1/lex/usuarios/get', { id }).then((r) => r.data),
  create: (data: { nome: string; email: string; senha: string; role: Role }) =>
    api.post<Usuario>('/k1/lex/usuarios', data).then((r) => r.data),
  update: (id: string, data: Partial<Usuario & { senha?: string }>) =>
    api.post<Usuario>('/k1/lex/usuarios/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/k1/lex/usuarios/delete', { id }).then((r) => r.data),
}
