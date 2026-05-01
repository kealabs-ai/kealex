import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeiroApi } from '../api/financeiro'
import type { Honorario } from '../types'

export const FINANCEIRO_KEY = ['financeiro']

export function useHonorarios() {
  return useQuery({ queryKey: FINANCEIRO_KEY, queryFn: financeiroApi.list })
}

export function useDashboardFinanceiro() {
  return useQuery({ queryKey: [...FINANCEIRO_KEY, 'dashboard'], queryFn: financeiroApi.dashboard })
}

export function useCreateHonorario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: financeiroApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: FINANCEIRO_KEY }),
  })
}

export function useUpdateHonorario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Honorario> }) => financeiroApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: FINANCEIRO_KEY }),
  })
}

export function useDeleteHonorario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: financeiroApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: FINANCEIRO_KEY }),
  })
}
