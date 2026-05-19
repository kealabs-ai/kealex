import { api } from './client'
import type { Processo } from '../types'

export const processosApi = {
  list: async () => {
    console.log('processosApi.list: Making API call...')
    const response = await api.get<Processo[]>('/processos')
    console.log('processosApi.list: Response status:', response.status)
    console.log('processosApi.list: Response data:', response.data)
    return response.data
  },
  get: (id: string) => api.post<Processo>('/processos/get', { id }).then((r) => r.data),
  create: (data: Omit<Processo, keyof import('../types').BaseEntity | 'status' | 'advogadoId'>) =>
    api.post<Processo>('/processos', data).then((r) => r.data),
  update: (id: string, data: Partial<Processo>) =>
    api.post<Processo>('/processos/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/processos/delete', { id }).then((r) => r.data),
}
