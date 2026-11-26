import { api } from './client'

export interface ProcessoAcompanhado {
  id: string
  numero_processo: string
  tribunal?: string | null
  classe_processual?: string | null
  assunto?: string | null
  fase_atual?: string | null
  situacao?: string | null
  data_ultima_movimentacao?: string | null
  ultima_consulta_em: string
  dados: Record<string, unknown>
}

export interface HistoricoConsulta {
  id: string
  consultado_em: string
  fornecedor: string
  status_consulta: string
  houve_alteracao: boolean | null
  data_ultima_movimentacao?: string | null
}

export const processosAcompanhadosApi = {
  list: (params: { page: number; page_size: number; search?: string; tribunal?: string; fase?: string; situacao?: string }) =>
    api.get<{ items: ProcessoAcompanhado[]; total: number; page: number; page_size: number; filters: { tribunais: string[]; fases: string[]; situacoes: string[] } }>('/k1/lex/processos-acompanhados', { params }).then((r) => r.data),
  consultar: (numero: string) => api.post<ProcessoAcompanhado>('/k1/lex/processos-acompanhados/consultar', { numero_processo: numero }, { timeout: 50000 }).then((r) => r.data),
  atualizar: (id: string) => api.post<ProcessoAcompanhado>(`/k1/lex/processos-acompanhados/${encodeURIComponent(id)}/atualizar`, undefined, { timeout: 50000 }).then((r) => r.data),
  historico: (id: string) => api.get<HistoricoConsulta[]>(`/k1/lex/processos-acompanhados/${encodeURIComponent(id)}/historico`).then((r) => r.data),
}
