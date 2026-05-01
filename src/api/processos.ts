import { api } from './client'
import type { Processo } from '../types'

export const processosApi = {
  list: () => api.get<Processo[]>('/processos').then((r) => r.data),
  get: (id: string) => api.get<Processo>(`/processos/${id}`).then((r) => r.data),
  create: (data: Omit<Processo, keyof import('../types').BaseEntity | 'status' | 'advogadoId'>) =>
    api.post<Processo>('/processos', data).then((r) => r.data),
  update: (id: string, data: Partial<Processo>) =>
    api.patch<Processo>(`/processos/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/processos/${id}`).then((r) => r.data),
}
