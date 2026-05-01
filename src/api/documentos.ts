import { api } from './client'
import type { Documento } from '../types'

export const documentosApi = {
  list: () => api.get<Documento[]>('/documentos').then((r) => r.data),
  byProcesso: (processoId: string) =>
    api.get<Documento[]>(`/documentos/processo/${processoId}`).then((r) => r.data),
  get: (id: string) => api.get<Documento>(`/documentos/${id}`).then((r) => r.data),
  create: (data: { processoId: string; nome: string; tipo: string; urlArquivo: string; tamanhoBytes: number }) =>
    api.post<Documento>('/documentos', data).then((r) => r.data),
  update: (id: string, data: Partial<Documento>) =>
    api.patch<Documento>(`/documentos/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/documentos/${id}`).then((r) => r.data),
}
