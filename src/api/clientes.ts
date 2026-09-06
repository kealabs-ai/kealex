import { api } from './client'
import type { Cliente } from '../types'

export const clientesApi = {
  list: () => api.get<Cliente[]>('/k1/lex/clientes').then((r) => r.data),
  get: (id: string) => api.post<Cliente>('/k1/lex/clientes/get', { id }).then((r) => r.data),
  create: (data: Omit<Cliente, keyof import('../types').BaseEntity | 'advogadoId' | 'tenantId'>) =>
    api.post<Cliente>('/k1/lex/clientes', data).then((r) => r.data),
  update: (id: string, data: Partial<Cliente>) =>
    api.post<Cliente>('/k1/lex/clientes/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/k1/lex/clientes/delete', { id }).then((r) => r.data),
}
