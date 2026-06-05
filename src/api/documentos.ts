import { api } from './client'
import type { Documento } from '../types'

export const documentosApi = {
  list: () => api.get<Documento[]>('/documentos').then((r) => r.data).catch(() => []),
  byProcesso: (processoId: string) =>
    api.post<Documento[]>('/documentos/by-processo', { processoId }).then((r) => r.data).catch(() => []),
  get: (id: string) => api.post<Documento>('/documentos/get', { id }).then((r) => r.data),
  create: (data: { processoId: string; nome: string; tipo: string; urlArquivo: string; tamanhoBytes: number }) =>
    api.post<Documento>('/documentos', data).then((r) => r.data),
  update: (id: string, data: Partial<Documento>) =>
    api.post<Documento>('/documentos/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/documentos/delete', { id }).then((r) => r.data),
}
