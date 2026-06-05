import { api } from './client'
import type { Prazo } from '../types'

export const prazosApi = {
  list: () => api.get<Prazo[]>('/prazos').then((r) => r.data).catch(() => []),
  vencendo: (dias = 7) => api.post<Prazo[]>('/prazos/vencendo', { dias }).then((r) => r.data).catch(() => []),
  byProcesso: (processoId: string) =>
    api.post<Prazo[]>('/prazos/by-processo', { processoId }).then((r) => r.data).catch(() => []),
  get: (id: string) => api.post<Prazo>('/prazos/get', { id }).then((r) => r.data),
  create: (data: { processoId: string; titulo: string; descricao: string; dataVencimento: string }) =>
    api.post<Prazo>('/prazos', data).then((r) => r.data),
  update: (id: string, data: Partial<Prazo>) =>
    api.post<Prazo>('/prazos/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/prazos/delete', { id }).then((r) => r.data),
}
