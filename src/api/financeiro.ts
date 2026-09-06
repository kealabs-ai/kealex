import { api } from './client'
import type { Honorario, DashboardFinanceiro } from '../types'

export const financeiroApi = {
  list: () => api.get<Honorario[]>('/k1/lex/financeiro').then((r) => r.data),
  dashboard: () => api.get<DashboardFinanceiro>('/k1/lex/financeiro/dashboard').then((r) => r.data),
  get: (id: string) => api.post<Honorario>('/k1/lex/financeiro/get', { id }).then((r) => r.data),
  create: (data: { processoId: string; clienteId: string; descricao: string; valorCentavos: number; dataVencimento: string }) =>
    api.post<Honorario>('/k1/lex/financeiro', data).then((r) => r.data),
  update: (id: string, data: Partial<Honorario>) =>
    api.post<Honorario>('/k1/lex/financeiro/update', { id, ...data }).then((r) => r.data),
  remove: (id: string) => api.post('/k1/lex/financeiro/delete', { id }).then((r) => r.data),
}
