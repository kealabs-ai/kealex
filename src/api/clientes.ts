import { api } from './client'
import type { Cliente } from '../types'

export const clientesApi = {
  list: () => api.get<Cliente[]>('/v1/lex/clientes').then((r) => r.data),
  search: (query: string, page = 1) => api.get<{ items: Cliente[]; total: number; page: number; pageSize: number }>('/k1/lex/clientes/search', { params: { q: query, page, page_size: 20 } }).then((r) => r.data),
  get: (id: string) => api.post<Cliente>('/v1/lex/clientes/get', { id }).then((r) => r.data),
  create: (data: Omit<Cliente, keyof import('../types').BaseEntity | 'advogadoId' | 'tenantId'>) =>
    api.post<Cliente>('/v1/lex/clientes', data).then((r) => r.data),
  update: (id: string, data: Partial<Cliente>) =>
    api.post<Cliente>('/v1/lex/clientes/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/v1/lex/clientes/delete', { id }).then((r) => r.data),
}
