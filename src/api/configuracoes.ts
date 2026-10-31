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
  configured?: boolean
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
  openai: string[]
  google: string[]
  claude: string[]
  deepseek: string[]
}

export type IaProvider = keyof ModelosDisponiveis
export interface IaProviderConfig {
  tenant_id: string
  user_id: string
  provider: IaProvider
  api_key?: string
  endpoint_url?: string
  modelo: string
  max_tokens: number
  system_prompt?: string
  ativo: boolean
  configured?: boolean
}
export interface IaProvidersConfig {
  active_provider: IaProvider
  providers: Partial<Record<IaProvider, IaProviderConfig>>
}

export interface UserIaApiKey {
  id: string
  provider: IaProvider
  model: string
  api_key_masked: string
  is_active: boolean
  created_at: string
  updated_at: string
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
  getGeral: () => api.get<CfgGeral>('/k1/lex/configuracoes/geral').then((r) => r.data).catch(() => null),
  saveGeral: (data: Partial<CfgGeral>) => api.post<CfgGeral>('/k1/lex/configuracoes/geral', data).then((r) => r.data),

  // CDN
  getCdn: () => api.get<CfgCdn>('/k1/lex/configuracoes/cdn').then((r) => r.data).catch(() => null),
  saveCdn: (data: Partial<CfgCdn>) => api.post<CfgCdn>('/k1/lex/configuracoes/cdn', data).then((r) => r.data),

  // Database
  getDatabase: () => api.get<CfgDatabase>('/k1/lex/configuracoes/database').then((r) => r.data).catch(() => null),
  getDatabaseEnv: () => api.get<DatabaseEnv>('/k1/lex/admin/config/env').then((r) => r.data).catch(() => null),
  saveDatabase: (data: Partial<CfgDatabase>) => api.post<CfgDatabase>('/k1/lex/configuracoes/database', data).then((r) => r.data),

  // IA
  getIa: () => api.get<CfgIa>('/k1/lex/configuracoes/ia').then((r) => r.data).catch(() => null),
  getIaProviders: () => api.get<IaProvidersConfig>('/k1/lex/configuracoes/ia/provedores').then((r) => r.data),
  getMyIaKeys: () => api.get<UserIaApiKey[]>('/k1/lex/configuracoes/ia/minhas-chaves').then((r) => r.data),
  createMyIaKey: (data: { provider: IaProvider; model: string; api_key: string; is_active: boolean }) => api.post<UserIaApiKey>('/k1/lex/configuracoes/ia/minhas-chaves', data).then((r) => r.data),
  updateMyIaKey: (id: string, data: Partial<{ provider: IaProvider; model: string; api_key: string; is_active: boolean }>) => api.put<UserIaApiKey>(`/k1/lex/configuracoes/ia/minhas-chaves/${id}`, data).then((r) => r.data),
  deleteMyIaKey: (id: string) => api.delete(`/k1/lex/configuracoes/ia/minhas-chaves/${id}`).then((r) => r.data),
  saveIaProvider: (provider: IaProvider, data: Partial<IaProviderConfig>) => api.post<IaProviderConfig>(`/k1/lex/configuracoes/ia/provedores/${provider}`, data).then((r) => r.data),
  activateIaProvider: (provider: IaProvider) => api.post<CfgIa>(`/k1/lex/configuracoes/ia/provedor-ativo/${provider}`).then((r) => r.data),
  getIaAtiva: () => api.get<CfgIa>('/k1/lex/configuracoes/ia/ativa').then((r) => r.data).catch(() => null),
  getModelosDisponiveis: () => api.get<ModelosDisponiveis>('/k1/lex/configuracoes/ia/modelos').then((r) => r.data).catch(() => ({
    cerebras: ['llama-3.3-70b', 'llama-3.1-70b', 'llama-3.1-8b'],
    groq: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
    openai: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano'],
    google: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'],
    claude: ['claude-opus-5', 'claude-sonnet-5', 'claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    deepseek: ['deepseek-chat', 'deepseek-reasoner'],
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
