import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { prazosApi } from '../api/prazos'
import type { Prazo } from '../types'

export const PRAZOS_KEY = ['prazos']

export function usePrazos() {
  return useQuery({ queryKey: PRAZOS_KEY, queryFn: prazosApi.list })
}

export function usePrazosVencendo(dias = 7) {
  return useQuery({
    queryKey: [...PRAZOS_KEY, 'vencendo', dias],
    queryFn: () => prazosApi.vencendo(dias),
  })
}

export function useCreatePrazo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: prazosApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: PRAZOS_KEY }),
  })
}

export function useUpdatePrazo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Prazo> }) => prazosApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRAZOS_KEY }),
  })
}

export function useDeletePrazo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: prazosApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: PRAZOS_KEY }),
  })
}
