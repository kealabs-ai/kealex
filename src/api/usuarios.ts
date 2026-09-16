import { api } from './client'
import type { Usuario, Role } from '../types'

export const usuariosApi = {
  list: (role?: Role) =>
    api.get<Usuario[]>('/v1/lex/usuarios', { params: role ? { role } : {} }).then((r) => r.data),

  get: (id: string) =>
    api.post<Usuario>('/v1/lex/usuarios/get', { id }).then((r) => r.data),

  create: (data: { nome: string; email: string; senha: string; role: Role; escritorioId?: string }) =>
    api.post<Usuario>('/v1/lex/usuarios', data).then((r) => r.data),

  update: (id: string, data: Partial<Usuario & { senha?: string; escritorioId?: string }>) =>
    api.post<Usuario>('/v1/lex/usuarios/update', { id, ...data }).then((r) => r.data),

  remove: (id: string) =>
    api.post('/v1/lex/usuarios/delete', { id }).then((r) => r.data),

  // Associa usuário a um escritório (modalidade escritório)
  associarEscritorio: (userId: string, escritorioId: string) =>
    api.post<Usuario>('/v1/lex/usuarios/update', { id: userId, escritorioId }).then((r) => r.data),

  // Remove associação com escritório (modalidade autônomo)
  desassociarEscritorio: (userId: string) =>
    api.post<Usuario>('/v1/lex/usuarios/update', { id: userId, clearEscritorio: true }).then((r) => r.data),
}
