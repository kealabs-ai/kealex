import { api } from './client'
import type { Documento } from '../types'

export const documentosApi = {
  list: () => api.get<Documento[]>('/k1/lex/documentos').then((r) => r.data),
  byProcesso: (processoId: string) =>
    api.post<Documento[]>('/k1/lex/documentos/by-processo', { processoId }).then((r) => r.data),
  get: (id: string) => api.post<Documento>('/k1/lex/documentos/get', { id }).then((r) => r.data),
  create: (data: { processoId: string; nome: string; tipo: string; urlArquivo: string; tamanhoBytes: number }) =>
    api.post<Documento>('/k1/lex/documentos', data).then((r) => r.data),
  update: (id: string, data: Partial<Documento>) =>
    api.post<Documento>('/k1/lex/documentos/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/k1/lex/documentos/delete', { id }).then((r) => r.data),
}
