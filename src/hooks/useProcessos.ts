import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { processosApi } from '../api/processos'
import type { Processo } from '../types'

export const PROCESSOS_KEY = ['processos']

export function useProcessos() {
  return useQuery({ 
    queryKey: PROCESSOS_KEY, 
    queryFn: async () => {
      console.log('useProcessos: Fetching processos...')
      const result = await processosApi.list()
      console.log('useProcessos: Received processos:', result?.length ?? 0)
      return result
    },
    staleTime: 0,
    gcTime: 0
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

export function useAvancarFase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      console.log('useAvancarFase: Calling API with', { id })
      return processosApi.avancarFase(id)
    },
    onSuccess: (data) => {
      console.log('useAvancarFase: Success', data)
      qc.invalidateQueries({ queryKey: PROCESSOS_KEY })
    },
    onError: (error: any) => {
      console.error('useAvancarFase error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        full: error,
      })
    },
  })
}
