import { api } from './client'

export interface CfgGeral {
  tenant_id: string
  user_id: string
  escritorio_id?: string
  nome_plataforma: string
  url_base: string
  email_suporte: string
  descricao?: string
  fuso_horario: string
  idioma: string
  modo_manutencao: boolean
  updated_at: string
}

export interface CfgCdn {
  tenant_id: string
  user_id: string
  escritorio_id?: string
  provider: string
  bucket?: string
  region?: string
  access_key_id?: string
  secret_access_key?: string
  cdn_url?: string
  tamanho_max_mb: number
  tipos_permitidos: string
  retencao_arquivo: boolean
  retencao_delete: boolean
  updated_at: string
}

export interface CfgDatabase {
  tenant_id: string
  user_id: string
  escritorio_id?: string
  tipo: string
  connection_string?: string
  pool_size: number
  timeout_segundos: number
  ssl_enabled: boolean
  query_logging: boolean
  read_replicas: boolean
  backup_frequencia: string
  backup_retencao: number
  updated_at: string
}

export interface CfgIa {
  tenant_id: string
  user_id: string
  escritorio_id?: string
  provider: string
  api_key?: string
  cerebras_api_key?: string
  groq_api_key?: string
  modelo: string
  max_tokens: number
  system_prompt?: string
  ativo: boolean
  updated_at: string
}

export interface CfgUsuarios {
  tenant_id: string
  user_id: string
  escritorio_id?: string
  max_tentativas_login: number
  bloqueio_minutos: number
  senha_min_chars: number
  senha_maiusculas: boolean
  senha_numeros: boolean
  senha_especiais: boolean
  senha_expiracao_dias: number
  sessao_inativa_min: number
  registro_modo: string
  updated_at: string
}

export interface CfgSeguranca {
  tenant_id: string
  user_id: string
  escritorio_id?: string
  twofa_obrigatorio: boolean
  oauth_google: boolean
  oauth_microsoft: boolean
  jwt_expiracao_horas: number
  log_acoes: boolean
  log_documentos: boolean
  alerta_suspeito: boolean
  ips_bloqueados?: string
  lgpd_consentimento: boolean
  lgpd_esquecimento: boolean
  lgpd_exportacao: boolean
  updated_at: string
}

export interface CfgNotificacoes {
  tenant_id: string
  user_id: string
  escritorio_id?: string
  email_provider: string
  email_region?: string
  email_access_key?: string
  email_secret_key?: string
  email_remetente?: string
  notif_prazos: boolean
  notif_honorarios: boolean
  notif_documentos: boolean
  notif_relatorio: boolean
  notif_push: string
  notif_sms: string
  updated_at: string
}

export interface ModelosDisponiveis {
  cerebras: string[]
  groq: string[]
}

export interface DatabaseEnv {
  host: string
  port: string
  name: string
  user: string
  password: string
  connection_string: string
}

export const configuracoesApi = {
  // Geral
  getGeral: () => api.get<CfgGeral>('/v1/lex/configuracoes/geral').then((r) => r.data).catch(() => null),
  saveGeral: (data: Partial<CfgGeral>) => api.post<CfgGeral>('/v1/lex/configuracoes/geral', data).then((r) => r.data),

  // CDN
  getCdn: () => api.get<CfgCdn>('/k1/lex/configuracoes/cdn').then((r) => r.data).catch(() => null),
  saveCdn: (data: Partial<CfgCdn>) => api.post<CfgCdn>('/k1/lex/configuracoes/cdn', data).then((r) => r.data),

  // Database
  getDatabase: () => api.get<CfgDatabase>('/k1/lex/configuracoes/database').then((r) => r.data).catch(() => null),
  getDatabaseEnv: () => api.get<DatabaseEnv>('/k1/lex/admin/config/env').then((r) => r.data).catch(() => null),
  saveDatabase: (data: Partial<CfgDatabase>) => api.post<CfgDatabase>('/k1/lex/configuracoes/database', data).then((r) => r.data),

  // IA
  getIa: () => api.get<CfgIa>('/k1/lex/configuracoes/ia').then((r) => r.data).catch(() => null),
  getIaAtiva: () => api.get<CfgIa>('/k1/lex/configuracoes/ia/ativa').then((r) => r.data).catch(() => null),
  getModelosDisponiveis: () => api.get<ModelosDisponiveis>('/k1/lex/configuracoes/ia/modelos').then((r) => r.data).catch(() => ({
    cerebras: ['llama-3.3-70b', 'llama-3.1-70b', 'llama-3.1-8b'],
    groq: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant']
  })),
  saveIa: (data: Partial<CfgIa>) => api.post<CfgIa>('/k1/lex/configuracoes/ia', data).then((r) => r.data),

  // Usuários
  getUsuarios: () => api.get<CfgUsuarios>('/k1/lex/configuracoes/usuarios').then((r) => r.data).catch(() => null),
  saveUsuarios: (data: Partial<CfgUsuarios>) => api.post<CfgUsuarios>('/k1/lex/configuracoes/usuarios', data).then((r) => r.data),

  // Segurança
  getSeguranca: () => api.get<CfgSeguranca>('/k1/lex/configuracoes/seguranca').then((r) => r.data).catch(() => null),
  saveSeguranca: (data: Partial<CfgSeguranca>) => api.post<CfgSeguranca>('/k1/lex/configuracoes/seguranca', data).then((r) => r.data),

  // Notificações
  getNotificacoes: () => api.get<CfgNotificacoes>('/k1/lex/configuracoes/notificacoes').then((r) => r.data).catch(() => null),
  saveNotificacoes: (data: Partial<CfgNotificacoes>) => api.post<CfgNotificacoes>('/k1/lex/configuracoes/notificacoes', data).then((r) => r.data),
}
