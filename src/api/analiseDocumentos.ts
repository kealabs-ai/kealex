import { api } from './client'

export type AnaliseDocumento = {
  id: string
  nome: string
  extensao: 'pdf' | 'doc' | 'docx' | 'txt' | 'md'
  tamanhoBytes: number
  paginas: number | null
  status: 'processado'
  createdAt: string
}

export type AnaliseMensagem = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type AnaliseConversa = {
  id: string
  titulo: string
  createdAt: string
  updatedAt: string
  documentos: AnaliseDocumento[]
  mensagens: AnaliseMensagem[]
}

const base = '/k1/lex/analise-documentos'

export const analiseDocumentosApi = {
  list: () => api.get<AnaliseConversa[]>(`${base}/conversas`).then((response) => response.data),
  get: (id: string) => api.get<AnaliseConversa>(`${base}/conversas/${id}`).then((response) => response.data),
  create: () => api.post<AnaliseConversa>(`${base}/conversas`, {}).then((response) => response.data),
  remove: (id: string) => api.delete<{ ok: boolean }>(`${base}/conversas/${id}`).then((response) => response.data),
  upload: (conversaId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<AnaliseDocumento>(`${base}/conversas/${conversaId}/documentos`, formData, { timeout: 150_000 }).then((response) => response.data)
  },
  removeDocumento: (conversaId: string, documentoId: string) =>
    api.delete<{ ok: boolean }>(`${base}/conversas/${conversaId}/documentos/${documentoId}`).then((response) => response.data),
  send: (conversaId: string, content: string, agenteId?: string) =>
    api.post<AnaliseMensagem>(`${base}/conversas/${conversaId}/mensagens`, { content, agente_id: agenteId || null }).then((response) => response.data),
}
