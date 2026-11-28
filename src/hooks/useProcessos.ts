import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { processosApi, type ProcessoMutationInput } from '../api/processos'
import { logger } from '../utils/logger'

export const PROCESSOS_KEY = ['processos']

export function useProcessos(enabled = true) {
  return useQuery({
    queryKey: PROCESSOS_KEY,
    queryFn: () => processosApi.list(),
    enabled,
  })
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
    mutationFn: ({ id, data }: { id: string; data: ProcessoMutationInput }) => processosApi.update(id, data),
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

export function useAvancarFase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, faseAtual }: { id: string; faseAtual: number }) =>
      processosApi.avancarFase(id, faseAtual),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROCESSOS_KEY }),
    onError: () => logger.error('process.phase_advance_mutation_failed'),
  })
}
