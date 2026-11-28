import { api } from './client'
import type { Processo } from '../types'
import type { Cliente } from '../types'
import { logger } from '../utils/logger'

export type ProcessoMutationInput = Pick<Processo, 'numero' | 'titulo' | 'descricao' | 'clienteId' | 'vara' | 'tribunal'> & {
  status?: Processo['status']
  fases?: string[]
  clientesVinculados?: ProcessoClienteInput[]
}

export const processosApi = {
  list: async () => {
    const response = await api.get<Processo[]>('/k1/lex/processos')
    return response.data
  },
  get: (id: string) => api.post<Processo>('/k1/lex/processos/get', { id }).then((r) => r.data),
  create: (data: ProcessoMutationInput) => api.post<Processo>('/k1/lex/processos', data).then((r) => r.data),
  update: (id: string, data: ProcessoMutationInput) =>
    api.post<Processo>('/k1/lex/processos/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/k1/lex/processos/delete', { id }).then((r) => r.data),
  clients: (processId: string) => api.get<ProcessoClienteVinculado[]>(`/k1/lex/processos/${encodeURIComponent(processId)}/clients`).then((r) => r.data),
  replaceClients: (processId: string, clients: ProcessoClienteInput[]) => api.post<ProcessoClienteVinculado[]>(`/k1/lex/processos/${encodeURIComponent(processId)}/clients`, { clientes: clients }).then((r) => r.data),
  parties: (processId: string) => api.get<ProcessoParte[]>(`/k1/lex/processos/${encodeURIComponent(processId)}/parties`).then((r) => r.data),
  addParty: (processId: string, party: ProcessoParteInput) => api.post<ProcessoParte>(`/k1/lex/processos/${encodeURIComponent(processId)}/parties`, party).then((r) => r.data),
  avancarFase: async (id: string, faseAtual: number) => {
    try {
      const response = await api.post<Processo>('/k1/lex/processos/avancar-fase', { processoId: id, faseAtual })
      return response.data
    } catch (error: unknown) {
      logger.error('process.phase_advance_failed')
      throw error
    }
  }
}

export type ProcessoClienteInput = { clienteId: string; proceduralRole: string; proceduralPole?: string; isPrimary: boolean; notes?: string }
export type ProcessoClienteVinculado = Cliente & { linkId: string; proceduralRole: string; proceduralPole?: string | null; isPrimary: boolean; qualificationSnapshot?: Record<string, unknown> | null; notes?: string | null }
export type ProcessoParteInput = { name: string; personType: 'fisica' | 'juridica'; document?: string; email?: string; phone?: string; address?: string; proceduralRole: string; isUnknown: boolean }
export type ProcessoParte = ProcessoParteInput & { id: string }
