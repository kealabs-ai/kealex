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
  address?: string
  neighborhood?: string
  city?: string
  state?: string
}

export type Periodicidade = 'mensal' | 'trimestral'

export interface AssinarPayload {
  plano: 'starter' | 'professional'
  periodicidade: Periodicidade
  asaasCustomerId: string
  creditCard: CreditCardData
  holderInfo: HolderInfo
  remoteIp?: string
}

export interface AssinarPixPayload {
  plano: 'starter' | 'professional'
  periodicidade: Periodicidade
  asaasCustomerId: string
}

export interface AssinarResult {
  subscriptionId: string
  plano: string
  periodicidade: Periodicidade
  status: string
  nextDueDate: string
  value: number
  valorMensal: number
  desconto: number
}

export interface AssinarPixResult {
  subscriptionId: string
  plano: string
  periodicidade: Periodicidade
  status: string
  nextDueDate: string
  value: number
  valorMensal: number
  desconto: number
  pixQrCode: string
  pixKey: string
  pixExpiresAt: string
}

/** Status Asaas que representam pagamento aprovado/ativo */
export const ASAAS_STATUS_APROVADO = new Set(['ACTIVE', 'CONFIRMED', 'RECEIVED'])

async function getPayerIp(): Promise<string> {
  const response = await fetch('https://api.ipify.org?format=json', {
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) throw new Error('Não foi possível identificar o IP do pagador para processar o cartão.')
  const data: { ip?: string } = await response.json()
  if (!data.ip) throw new Error('O serviço de identificação do IP não retornou um endereço válido.')
  return data.ip
}

export function calcularValores(valorMensal: number, periodicidade: Periodicidade) {
  const meses = periodicidade === 'trimestral' ? 3 : 1
  const percentualDesconto = periodicidade === 'trimestral' ? 0.05 : 0
  const valorBruto = valorMensal * meses
  const valorDesconto = valorBruto * percentualDesconto
  const valorFinal = valorBruto - valorDesconto
  return { meses, percentualDesconto, valorBruto, valorDesconto, valorFinal }
}

export interface BillingStatus {
  plano: string
  status: 'trial' | 'trial_expired' | 'pending' | 'active' | 'past_due' | 'canceled' | 'inactive'
  subscriptionStatus: string | null
  nextDueDate: string | null
  trialExpiresAt: string | null
  subscriptionExpiresAt: string | null
}

export interface AssinaturaExistente {
  subscriptionId: string
  plano: string
  periodicidade: Periodicidade
  valor: number
  status: string
  subscriptionStatus: string
  billingType?: 'PIX' | 'CREDIT_CARD' | null
  createdAt: string
  nextDueDate: string | null
  pixQrCode?: string
  pixKey?: string
  pixExpiresAt?: string
}

export interface BillingProfile {
  name: string
  email: string
  cpfCnpj: string
  billing_cpf_cnpj?: string
  phone: string
  mobilePhone: string
  postalCode: string
  address: string
  addressNumber: string
  addressComplement: string
  neighborhood: string
  city: string
  state: string
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
    getPayerIp().then((remoteIp) =>
      api.post<AssinarResult>('/k1/lex/auth/assinar', { ...payload, remoteIp }, { timeout: 60_000 }).then((r) => r.data),
    ),

  assinarPix: (payload: AssinarPixPayload) =>
    api.post<AssinarPixResult>('/k1/lex/auth/assinar-pix', payload).then((r) => r.data),

  billingStatus: () =>
    api.get<BillingStatus>('/k1/lex/auth/billing-status').then((r) => r.data),

  billingProfile: () =>
    api.get<BillingProfile>('/k1/lex/auth/billing-profile').then((r) => r.data),

  updateBillingProfile: (data: BillingProfile) =>
    api.put<BillingProfile>('/k1/lex/auth/billing-profile', data).then((r) => r.data),

  getAssinatura: () =>
    api.get<AssinaturaExistente>('/k1/lex/auth/assinatura').then((r) => r.data),

  reativarAssinatura: () =>
    api.post<AssinarResult>('/k1/lex/auth/assinatura/reativar', {}, { timeout: 60_000 }).then((r) => r.data),
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

export const PERIODICIDADES_CONFIG = [
  { id: 'mensal' as Periodicidade, label: 'Mensal', meses: 1, desconto: 0 },
  { id: 'trimestral' as Periodicidade, label: 'Trimestral', meses: 3, desconto: 0.05 },
]
