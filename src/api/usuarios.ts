import { api } from './client'
import type { Usuario, Role } from '../types'

export const usuariosApi = {
  list: (role?: Role) =>
    api.get<Usuario[]>('/v1/lex/usuarios', { params: role ? { role } : {} }).then((r) => r.data),

  get: (id: string) =>
    api.post<Usuario>('/v1/lex/usuarios/get', { id }).then((r) => r.data),

  create: (data: { nome: string; email: string; senha: string; role: Role; escritorioId?: string; oab?: string }) =>
    api.post<Usuario>('/v1/lex/usuarios', { ...data, escritorioId: data.escritorioId || undefined }).then((r) => r.data),

  update: (id: string, data: Partial<Usuario & { senha?: string; escritorioId?: string; clearEscritorio?: boolean }>) => {
    const payload = { ...data } as typeof data
    if ('escritorioId' in payload) {
      if (payload.escritorioId) payload.clearEscritorio = false
      else {
        delete payload.escritorioId
        payload.clearEscritorio = true
      }
    }
    return api.post<Usuario>('/v1/lex/usuarios/update', { id, ...payload }).then((r) => r.data)
  },

  remove: (id: string) =>
    api.post('/v1/lex/usuarios/delete', { id }).then((r) => r.data),

  // Associa usuário a um escritório (modalidade escritório)
  associarEscritorio: (userId: string, escritorioId: string) =>
    api.post<Usuario>('/v1/lex/usuarios/update', { id: userId, escritorioId }).then((r) => r.data),

  // Remove associação com escritório (modalidade autônomo)
  desassociarEscritorio: (userId: string) =>
    api.post<Usuario>('/v1/lex/usuarios/update', { id: userId, clearEscritorio: true }).then((r) => r.data),

  listarChavesPublicas: () =>
    api.get<ChavePublicaIntegracao[]>('/v1/lex/usuarios/chaves-publicas').then((r) => r.data),

  consultarProcessoDataJud: (data: { tribunal: string; numeroProcesso: string }) =>
    api.post('/v1/lex/usuarios/consultas/datajud', data).then((r) => r.data),

  salvarChavePublica: (data: { orgao: string; chavePublica: string }) =>
    api.post<ChavePublicaIntegracao>('/v1/lex/usuarios/chaves-publicas', data).then((r) => r.data),

  atualizarChavePublica: (id: string, data: { orgao: string; chavePublica: string }) =>
    api.post<ChavePublicaIntegracao>(`/v1/lex/usuarios/chaves-publicas/${id}`, data).then((r) => r.data),

  removerChavePublica: (id: string) =>
    api.delete<{ ok: boolean }>(`/v1/lex/usuarios/chaves-publicas/${id}`).then((r) => r.data),
}

export type ChavePublicaIntegracao = {
  id: string
  userId: string
  orgao: string
  chavePublica: string
  createdAt: string
  updatedAt: string
}
