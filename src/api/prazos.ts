import { api } from './client'
import type { Prazo } from '../types'

export const prazosApi = {
  list: () => api.get<Prazo[]>('/k1/lex/prazos').then((r) => r.data),
  vencendo: (dias = 7) => api.post<Prazo[]>('/k1/lex/prazos/vencendo', { dias }).then((r) => r.data),
  byProcesso: (processoId: string) =>
    api.post<Prazo[]>('/k1/lex/prazos/by-processo', { processoId }).then((r) => r.data),
  get: (id: string) => api.post<Prazo>('/k1/lex/prazos/get', { id }).then((r) => r.data),
  create: (data: { processoId: string; titulo: string; descricao: string; dataVencimento: string }) =>
    api.post<Prazo>('/k1/lex/prazos', data).then((r) => r.data),
  update: (id: string, data: Partial<Prazo>) =>
    api.post<Prazo>('/k1/lex/prazos/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/k1/lex/prazos/delete', { id }).then((r) => r.data),
}
