import { api } from './client'
import type { AgenteIA } from '../types'

export const agentesApi = {
  list: () => api.get<AgenteIA[]>('/k1/lex/agentes').then((r) => r.data),
  listPublicos: () => api.get<AgenteIA[]>('/k1/lex/agentes/publicos').then((r) => r.data),
  get: (id: string) => api.get<AgenteIA>(`/k1/lex/agentes/${id}`).then((r) => r.data),
  create: (data: Partial<AgenteIA>) => api.post<AgenteIA>('/k1/lex/agentes', data).then((r) => r.data),
  update: (id: string, data: Partial<AgenteIA>) => api.put<AgenteIA>(`/k1/lex/agentes/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/k1/lex/agentes/${id}`),
  listMine: () => api.get<AgenteIA[]>('/k1/lex/agentes/meus').then((r) => r.data),
  createMine: (data: Partial<AgenteIA>) => api.post<AgenteIA>('/k1/lex/agentes/meus', data).then((r) => r.data),
  updateMine: (id: string, data: Partial<AgenteIA>) => api.put<AgenteIA>(`/k1/lex/agentes/meus/${id}`, data).then((r) => r.data),
  deleteMine: (id: string) => api.delete(`/k1/lex/agentes/meus/${id}`),
}
