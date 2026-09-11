import { api } from './client'
import type { Processo } from '../types'
import { logger } from '../utils/logger'

export const processosApi = {
  list: async () => {
    const response = await api.get<Processo[]>('/k1/lex/processos')
    return response.data
  },
  get: (id: string) => api.post<Processo>('/k1/lex/processos/get', { id }).then((r) => r.data),
  create: (data: any) => api.post<Processo>('/k1/lex/processos', data).then((r) => r.data),
  update: (id: string, data: any) =>
    api.post<Processo>('/k1/lex/processos/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/k1/lex/processos/delete', { id }).then((r) => r.data),
  avancarFase: async (id: string, faseAtual: number) => {
    try {
      const response = await api.post<Processo>('/k1/lex/processos/avancar-fase', { processoId: id, faseAtual })
      return response.data
    } catch (error: any) {
      logger.error('avancarFase error', error)
      throw error
    }
  }
}
