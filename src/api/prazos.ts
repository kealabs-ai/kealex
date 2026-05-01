import { api } from './client'
import type { Prazo } from '../types'

export const prazosApi = {
  list: () => api.get<Prazo[]>('/prazos').then((r) => r.data),
  vencendo: (dias = 7) => api.get<Prazo[]>(`/prazos/vencendo?dias=${dias}`).then((r) => r.data),
  byProcesso: (processoId: string) =>
    api.get<Prazo[]>(`/prazos/processo/${processoId}`).then((r) => r.data),
  get: (id: string) => api.get<Prazo>(`/prazos/${id}`).then((r) => r.data),
  create: (data: { processoId: string; titulo: string; descricao: string; dataVencimento: string }) =>
    api.post<Prazo>('/prazos', data).then((r) => r.data),
  update: (id: string, data: Partial<Prazo>) =>
    api.patch<Prazo>(`/prazos/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/prazos/${id}`).then((r) => r.data),
}
