import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { processosApi } from '../api/processos'
import type { Processo } from '../types'

export const PROCESSOS_KEY = ['processos']

export function useProcessos() {
  return useQuery({ queryKey: PROCESSOS_KEY, queryFn: processosApi.list })
}

export function useProcesso(id: string) {
  return useQuery({ queryKey: [...PROCESSOS_KEY, id], queryFn: () => processosApi.get(id), enabled: !!id })
}

export function useCreateProcesso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: processosApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROCESSOS_KEY }),
  })
}

export function useUpdateProcesso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Processo> }) => processosApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROCESSOS_KEY }),
  })
}

export function useDeleteProcesso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: processosApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROCESSOS_KEY }),
  })
}
