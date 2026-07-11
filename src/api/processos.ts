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
  create: (data: any) => {
    console.log('processosApi.create: Payload being sent:', JSON.stringify(data, null, 2))
    return api.post<Processo>('/k1/lex/processos', data).then((r) => r.data)
  },
  update: (id: string, data: any) => {
    console.log('processosApi.update: Payload being sent:', { id, ...data })
    return api.post<Processo>('/k1/lex/processos/update', { id, ...data }).then((r) => r.data)
  },
  remove: (id: string) => api.post('/k1/lex/processos/delete', { id }).then((r) => r.data),
  avancarFase: async (id: string, novaFase: number) => {
    const payload = { processoId: id, faseAtual: novaFase }
    console.log('avancarFase API call:', payload)
    try {
      const response = await api.post<Processo>('/k1/lex/processos/avancar-fase', payload)
      console.log('avancarFase response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('avancarFase error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      throw error
    }
  },
}
