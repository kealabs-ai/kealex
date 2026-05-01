import { api } from './client'
import type { Honorario, DashboardFinanceiro } from '../types'

export const financeiroApi = {
  list: () => api.get<Honorario[]>('/financeiro').then((r) => r.data),
  dashboard: () => api.get<DashboardFinanceiro>('/financeiro/dashboard').then((r) => r.data),
  get: (id: string) => api.get<Honorario>(`/financeiro/${id}`).then((r) => r.data),
  create: (data: { processoId: string; clienteId: string; descricao: string; valorCentavos: number; dataVencimento: string }) =>
    api.post<Honorario>('/financeiro', data).then((r) => r.data),
  update: (id: string, data: Partial<Honorario>) =>
    api.patch<Honorario>(`/financeiro/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/financeiro/${id}`).then((r) => r.data),
}
