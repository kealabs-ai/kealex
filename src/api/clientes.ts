import { api } from './client'
import type { Cliente } from '../types'

export const clientesApi = {
  list: () => api.get<Cliente[]>('/clientes').then((r) => r.data).catch(() => []),
  get: (id: string) => api.post<Cliente>('/clientes/get', { id }).then((r) => r.data),
  create: (data: Omit<Cliente, keyof import('../types').BaseEntity | 'advogadoId' | 'tenantId'>) =>
    api.post<Cliente>('/clientes', data).then((r) => r.data),
  update: (id: string, data: Partial<Cliente>) =>
    api.post<Cliente>('/clientes/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/clientes/delete', { id }).then((r) => r.data),
}
