import { api } from './client'
import type { Cobranca } from '../types'

export interface PagamentoCartaoPayload {
  cobrancaId: string
  customer: string
  billingType: 'CREDIT_CARD'
  description: string
}

export interface PagamentoHospedadoResult {
  cobrancaId: string
  asaasId: string
  status: string
  invoiceUrl: string | null
}

export interface ClientePagadorPayload {
  cobrancaId: string
  name: string
  email: string
  cpfCnpj: string
  postalCode: string
  addressNumber: string
  phone?: string
}

export const cobrancasApi = {
  list: () => api.get<Cobranca[]>('/k1/lex/cobrancas').then((r) => r.data),
  get: (id: string) => api.post<Cobranca>('/k1/lex/cobrancas/get', { id }).then((r) => r.data),
  create: (data: { processoId: string; clienteId: string; valorCentavos: number; dataVencimento?: string }) =>
    api.post<Cobranca>('/k1/lex/cobrancas', data).then((r) => r.data),
  proximaFase: (id: string) =>
    api.post<Cobranca>('/k1/lex/cobrancas/proxima-fase', { id }).then((r) => r.data),
  marcarPago: (id: string, observacao?: string) =>
    api.post<Cobranca>('/k1/lex/cobrancas/marcar-pago', { id, observacao }).then((r) => r.data),
  pagarComCartao: (payload: PagamentoCartaoPayload) =>
    api.post<PagamentoHospedadoResult>('/v1/lex/cobrancas/pagamento', payload).then((r) => r.data),
  criarClientePagador: (payload: ClientePagadorPayload) =>
    api.post<{ customerId: string }>('/v1/lex/cobrancas/pagador', payload).then((r) => r.data),
  cancelar: (id: string, motivo?: string) =>
    api.post<Cobranca>('/k1/lex/cobrancas/cancelar', { id, motivo }).then((r) => r.data),
  timeline: (id: string) =>
    api.post<CobrancaTimeline>('/k1/lex/cobrancas/timeline', { id }).then((r) => r.data),
}

export interface CobrancaTimeline {
  cobranca_id: string
  status_atual: string
  fase_atual: number
  valor_centavos: number
  data_vencimento: string | null
  data_pagamento: string | null
  fases: Array<{ ordem: number; label: string; descricao: string }>
  timeline: Array<{
    id: string
    acao: string
    fase_anterior: number | null
    fase_nova: number | null
    status_anterior: string | null
    status_novo: string | null
    observacao: string | null
    data: string
  }>
  proximas_acoes: Array<{ acao: string; label: string; descricao: string }>
}
