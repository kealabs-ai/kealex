import { api } from './client'

export interface GestaoDashboard {
  processosAtivos: number
  usuariosCadastrados: number
  keaCreditsDisponivel: number
  consultasTotal: number
  consultasPorFornecedor: { fiscalapi: number; escavador: number }
  topClientesConsultas: Array<{ clienteId: string; nome: string; quantidade: number }>
  financeiro: { totalPago: number; totalPendente: number; totalVencido: number; totalGeral: number }
}

export const gestaoApi = {
  dashboard: () => api.get<GestaoDashboard>('/k1/lex/gestao/dashboard').then((response) => response.data),
}
