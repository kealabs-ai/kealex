import { api } from './client'

export type AnaliseDocumento = {
  id: string
  nome: string
  extensao: 'pdf' | 'doc' | 'docx' | 'txt' | 'md'
  tamanhoBytes: number
  paginas: number | null
  status: 'processado'
  driveUrl?: string | null
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

export type GoogleDriveConfig = {
  configurado: boolean
  tipo: 'authorized_user' | 'service_account' | null
  driveFolderId: string | null
  updatedAt: string | null
}

export type GoogleDriveOAuthConnection = {
  connected: boolean
  email: string | null
  scope: string | null
  updatedAt: string | null
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
  getGoogleDriveConfig: () =>
    api.get<GoogleDriveConfig>(`${base}/configuracoes/google-drive`).then((response) => response.data),
  getGoogleDriveOAuthConnection: () =>
    api.get<GoogleDriveOAuthConnection>('/api/v1/integrations/google/connection').then((response) => response.data),
  startGoogleDriveOAuth: () =>
    api.get<{ authorizationUrl: string }>('/api/v1/integrations/google/auth/url').then((response) => response.data),
  startGoogleDriveUploadOAuth: (data: { client_id: string; client_secret: string }) =>
    api.post<{ authorizationUrl: string }>('/api/v1/integrations/google/upload/auth/url', data).then((response) => response.data),
  completeGoogleDriveOAuth: (data: { code: string; state: string }) =>
    api.post<{ connected: boolean; email: string | null; scope: string }>('/api/v1/integrations/google/callback', data).then((response) => response.data),
  completeGoogleDriveUploadOAuth: (data: { code: string; state: string; client_id: string; client_secret: string }) =>
    api.post<{ type: 'authorized_user'; client_id: string; client_secret: string; refresh_token: string }>('/api/v1/integrations/google/upload/callback', data).then((response) => response.data),
  listGoogleDriveFiles: (params?: { query?: string; page_size?: number; page_token?: string }) =>
    api.get<{ files: Array<{ id: string; name: string; mimeType: string; size?: string; modifiedTime?: string; webViewLink?: string }>; nextPageToken?: string }>('/api/v1/integrations/google/files', { params }).then((response) => response.data),
  getGoogleDriveFileContent: (fileId: string) =>
    api.get<Blob>(`/api/v1/integrations/google/files/${encodeURIComponent(fileId)}/content`, { responseType: 'blob' }).then((response) => response.data),
  saveGoogleDriveConfig: (data: { credential_json?: string; drive_folder_id?: string }) =>
    api.put<GoogleDriveConfig>(`${base}/configuracoes/google-drive`, data).then((response) => response.data),
  testGoogleDriveConfig: () =>
    api.post<{ ok: boolean; email: string; nome: string }>(`${base}/configuracoes/google-drive/testar`).then((response) => response.data),
  removeGoogleDriveConfig: () =>
    api.delete<{ ok: boolean }>(`${base}/configuracoes/google-drive`).then((response) => response.data),
}
