import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { CobrancaFase } from '../components/CobrancaFluxo'

export interface CobrancaFluxoData {
  id: string
  honorarioId: string
  fase: CobrancaFase
  dataInicio: string
  dataUltimaAcao?: string
  proximaAcao?: string
  descricao: string
  valor: number
  historico: Array<{
    data: string
    fase: CobrancaFase
    observacao?: string
  }>
}

export function useCobrancaFluxo(honorarioId?: string) {
  return useQuery({
    queryKey: ['cobrancaFluxo', honorarioId],
    queryFn: async () => {
      if (!honorarioId) return null
      const { data } = await api.get(`/api/cobranca-fluxo/${honorarioId}`)
      return data as CobrancaFluxoData
    },
    enabled: !!honorarioId,
  })
}

export function useCobrancaFluxoList() {
  return useQuery({
    queryKey: ['cobrancaFluxoList'],
    queryFn: async () => {
      const { data } = await api.get('/api/cobranca-fluxo')
      return data as CobrancaFluxoData[]
    },
  })
}

export function useUpdateCobrancaFase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ honorarioId, novaFase, observacao }: { honorarioId: string; novaFase: CobrancaFase; observacao?: string }) => {
      const { data } = await api.patch(`/api/cobranca-fluxo/${honorarioId}`, {
        fase: novaFase,
        observacao,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cobrancaFluxo'] })
      queryClient.invalidateQueries({ queryKey: ['cobrancaFluxoList'] })
      queryClient.invalidateQueries({ queryKey: ['honorarios'] })
    },
  })
}

export function useCreateCobrancaFluxo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { honorarioId: string; descricao: string; valor: number }) => {
      const { data: response } = await api.post('/api/cobranca-fluxo', data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cobrancaFluxoList'] })
    },
  })
}
