export type Role = 'admin' | 'advogado' | 'cliente'
export type StatusProcesso = 'ativo' | 'arquivado' | 'encerrado'
export type TipoDocumento = 'peticao' | 'contrato' | 'comprovante' | 'outro'
export type StatusDocumento = 'pendente' | 'aprovado' | 'rejeitado'
export type StatusHonorario = 'pendente' | 'pago' | 'vencido' | 'cancelado'
export type StatusPrazo = 'pendente' | 'concluido' | 'vencido'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface Processo extends BaseEntity {
  tenantId?: string
  numero: string
  titulo: string
  descricao: string
  status: StatusProcesso
  advogadoId: string
  clienteId: string
  clienteNome?: string
  clienteEmail?: string
  vara: string
  tribunal: string
}

export interface Cliente extends BaseEntity {
  tenantId: string
  advogadoId: string
  nome: string
  email: string
  telefone?: string
  cpfCnpj?: string
  endereco?: string
  observacoes?: string
}

export interface Documento extends BaseEntity {
  tenantId?: string
  processoId: string
  uploadadoPorId: string
  nome: string
  tipo: TipoDocumento
  status: StatusDocumento
  urlArquivo: string
  tamanhoBytes: number
}

export interface Honorario extends BaseEntity {
  processoId: string
  clienteId: string
  advogadoId: string
  descricao: string
  valorCentavos: number
  dataVencimento: string
  dataPagamento?: string
  status: StatusHonorario
}

export interface Prazo extends BaseEntity {
  processoId: string
  advogadoId: string
  titulo: string
  descricao: string
  dataVencimento: string
  status: StatusPrazo
}

export interface Usuario extends BaseEntity {
  tenantId?: string
  nome: string
  email: string
  role: Role
  ativo: boolean
}

export interface DashboardFinanceiro {
  totalPendente: number
  totalPago: number
  totalVencido: number
  totalGeral: number
}

export interface AuthUser {
  id: string
  tenantId?: string
  nome: string
  email: string
  role: Role
  accessToken: string
}

export type AIProvider = 'cerebras' | 'groq'

export interface AgenteIA extends BaseEntity {
  tenantId: string
  nome: string
  descricao?: string
  provider: AIProvider
  api_key: string
  modelo: string
  max_tokens: number
  system_prompt?: string
  ativo: boolean
  publico: boolean // Se pode ser usado por clientes
}
