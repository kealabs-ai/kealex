import { api } from './client'

export interface KeaCreditsWallet {
  saldoKeaCredits: number
}

export interface KeaCreditsRecharge {
  id: string
  credits: number
  value: number
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED' | 'FAILED'
  pixQrCode?: string
  pixCopyPaste?: string
  pixExpiresAt?: string
}

export const KEA_CREDITS_QUERY_KEY = ['kea-credits', 'wallet'] as const

export const keaCreditsApi = {
  wallet: () => api.get<KeaCreditsWallet>('/k1/lex/kea-store/carteira').then((response) => response.data),
  createRecharge: (packageId: string, idempotencyKey: string) =>
    api.post<KeaCreditsRecharge>('/k1/lex/kea-store/recargas', { packageId }, { headers: { 'Idempotency-Key': idempotencyKey } }).then((response) => response.data),
  recharge: (id: string) => api.get<KeaCreditsRecharge>(`/k1/lex/kea-store/recargas/${id}`).then((response) => response.data),
}
