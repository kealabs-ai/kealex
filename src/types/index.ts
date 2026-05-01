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
  numero: string
  titulo: string
  descricao: string
  status: StatusProcesso
  advogadoId: string
  clienteId: string
  vara: string
  tribunal: string
}

export interface Documento extends BaseEntity {
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
  nome: string
  role: Role
  accessToken: string
}
