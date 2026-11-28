import axios from 'axios'
import { api } from './client'
import type { Documento } from '../types'
import { privateDocumentFileMatch } from '../utils/documentUrls'

export type StoredFileSummary = {
  id: string
  name: string
  size: number
  contentType: string
  sha256: string
  processId: string | null
  createdAt: string | null
}

export const documentosApi = {
  list: () => api.get<Documento[]>('/k1/lex/documentos').then((r) => r.data),
  byProcesso: (processoId: string) =>
    api.post<Documento[]>('/k1/lex/documentos/by-processo', { processoId }).then((r) => r.data),
  get: (id: string) => api.post<Documento>('/k1/lex/documentos/get', { id }).then((r) => r.data),
  create: (data: { processoId: string; nome: string; tipo: string; urlArquivo: string; tamanhoBytes: number }) =>
    api.post<Documento>('/k1/lex/documentos', data).then((r) => r.data),
  uploadStoredFile: (file: File, processId: string, idempotencyKey: string) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<StoredFileSummary>(
      '/v1/lex/arquivos',
      formData,
      { params: { process_id: processId }, headers: { 'Idempotency-Key': idempotencyKey } },
    ).then((r) => r.data)
  },
  listStoredFiles: (processId: string) =>
    api.get<StoredFileSummary[]>('/v1/lex/arquivos', { params: { process_id: processId } }).then((r) => r.data),
  downloadStoredFile: async (fileId: string, name: string) => {
    const response = await api.get<Blob>(`/v1/lex/arquivos/${fileId}`, { responseType: 'blob' })
    return { data: response.data, name }
  },
  deleteStoredFile: (fileId: string) => api.delete(`/v1/lex/arquivos/${fileId}`),
  isStoredFile: (url: string) => privateDocumentFileMatch(url),
  update: (id: string, data: Partial<Documento>) =>
    api.post<Documento>('/k1/lex/documentos/update', { id, ...data }).then((r) => r.data),
  remove: async (id: string) => {
    let documento: Documento
    try {
      documento = await api.post<Documento>('/k1/lex/documentos/get', { id }).then((r) => r.data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return { ok: true }
      throw error
    }
    const storedFile = documentosApi.isStoredFile(documento.urlArquivo)
    if (storedFile) await documentosApi.deleteStoredFile(storedFile[1])
    try {
      return await api.post('/k1/lex/documentos/delete', { id }).then((r) => r.data)
    } catch (error) {
      try {
        await api.post<Documento>('/k1/lex/documentos/get', { id })
      } catch (reconciliationError) {
        if (axios.isAxiosError(reconciliationError) && reconciliationError.response?.status === 404) {
          return { ok: true }
        }
      }
      throw error
    }
  },
}
