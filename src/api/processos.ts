import { api } from './client'
import type { Processo } from '../types'

export const processosApi = {
  list: async () => {
    console.log('processosApi.list: Making API call...')
    const response = await api.get<Processo[]>('/k1/lex/processos')
    console.log('processosApi.list: Response status:', response.status)
    console.log('processosApi.list: Response data:', response.data)
    return response.data
  },
  get: (id: string) => api.post<Processo>('/k1/lex/processos/get', { id }).then((r) => r.data),
  create: (data: Omit<Processo, keyof import('../types').BaseEntity | 'status' | 'advogadoId'>) =>
    api.post<Processo>('/k1/lex/processos', data).then((r) => r.data),
  update: (id: string, data: Partial<Processo>) =>
    api.post<Processo>('/k1/lex/processos/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/k1/lex/processos/delete', { id }).then((r) => r.data),
  avancarFase: (id: string, novaFase: number) => {
    console.log('avancarFase API call:', { id, novaFase })
    return api.post<Processo>('/k1/lex/processos/avancar-fase', { id, novaFase }).then((r) => r.data)
  },
}
