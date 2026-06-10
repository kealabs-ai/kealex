import { api } from './client'
import type { AgenteIA } from '../types'

export const agentesApi = {
  list: () => api.get<AgenteIA[]>('/v1/lex/agentes').then((r) => r.data),
  listPublicos: () => api.get<AgenteIA[]>('/v1/lex/agentes/publicos').then((r) => r.data),
  get: (id: string) => api.post<AgenteIA>('/v1/lex/agentes/get', { id }).then((r) => r.data),
  create: (data: Partial<AgenteIA>) => api.post<AgenteIA>('/v1/lex/agentes', data).then((r) => r.data),
  update: (id: string, data: Partial<AgenteIA>) => api.post<AgenteIA>('/v1/lex/agentes/update', { id, ...data }).then((r) => r.data),
  delete: (id: string) => api.post('/v1/lex/agentes/delete', { id }),
}
