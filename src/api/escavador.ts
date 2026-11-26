import { api } from './client'

export interface EscavadorProcesso {
  numero_cnj?: string
  titulo_polo_ativo?: string
  titulo_polo_passivo?: string
  ano_inicio?: number
  data_inicio?: string
  data_ultima_movimentacao?: string
  quantidade_movimentacoes?: number
  quantidade_envolvidos?: number
  tribunal?: { nome?: string; sigla?: string }
  fontes?: Array<{
    nome?: string
    sigla?: string
    descricao?: string
    grau_formatado?: string
    status_predito?: string
    capa?: { classe?: string; assunto?: string; situacao?: string; orgao_julgador?: string; data_distribuicao?: string; valor_causa?: { valor_formatado?: string } }
  }>
  envolvidos?: Array<{ nome?: string; tipo_normalizado?: string; polo?: string; advogados?: Array<{ nome?: string }> }>
  processos_relacionados?: Array<{ numero?: string }>
  _integracao?: { creditosUtilizadosCentavos?: string | null }
}

export const escavadorApi = {
  consultarProcesso: (numeroCnj: string) =>
    api.get<EscavadorProcesso>(`/api/v1/escavador/processos/${encodeURIComponent(numeroCnj)}`).then((response) => response.data),
}
