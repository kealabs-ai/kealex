import { api } from './client'

export interface CreditCardData {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

export interface HolderInfo {
  name: string
  email: string
  cpfCnpj: string
  postalCode: string
  addressNumber: string
  addressComplement?: string
  phone?: string
  mobilePhone?: string
}

export interface AssinarPayload {
  plano: 'starter' | 'professional'
  asaasCustomerId: string
  creditCard: CreditCardData
  holderInfo: HolderInfo
  remoteIp?: string
}

export interface AssinarResult {
  subscriptionId: string
  plano: string
  status: string
  nextDueDate: string
  value: number
}

export interface PreRegisterResult {
  userId: string
  tenantId: string
  token: string
}

export const assinaturaApi = {
  preRegister: (data: { nome: string; email: string; senha: string }) =>
    api.post<PreRegisterResult>('/k1/lex/auth/pre-register', data).then((r) => r.data),

  criarClienteAsaas: (holderInfo: HolderInfo) =>
    api.post<{ customerId: string }>('/k1/lex/auth/criar-cliente-asaas', holderInfo).then((r) => r.data),

  assinar: (payload: AssinarPayload) =>
    api.post<AssinarResult>('/k1/lex/auth/assinar', payload).then((r) => r.data),
}

export const PLANOS_CONFIG = [
  {
    id: 'starter' as const,
    nome: 'Starter',
    valor: 197.0,
    descricao: 'Ideal para advogados autonomos',
    recursos: ['Ate 50 processos', 'Documentos ilimitados', 'IA basica', 'Suporte por email'],
    destaque: false,
  },
  {
    id: 'professional' as const,
    nome: 'Professional',
    valor: 397.0,
    descricao: 'Para escritorios em crescimento',
    recursos: ['Processos ilimitados', 'IA avancada', 'Relatorios', 'Suporte prioritario'],
    destaque: true,
  },
]
