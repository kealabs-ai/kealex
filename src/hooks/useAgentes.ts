import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentesApi } from '../api/agentes'

export const AGENTES_KEY = ['agentes']

export function useAgentes() {
  return useQuery({ 
    queryKey: AGENTES_KEY, 
    queryFn: agentesApi.list 
  })
}

export function useAgentesPublicos() {
  return useQuery({ 
    queryKey: [...AGENTES_KEY, 'publicos'], 
    queryFn: agentesApi.listPublicos 
  })
}

export function useAgente(id: string) {
  return useQuery({ 
    queryKey: [...AGENTES_KEY, id], 
    queryFn: () => agentesApi.get(id),
    enabled: !!id
  })
}

export function useCreateAgente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: agentesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: AGENTES_KEY }),
  })
}

export function useUpdateAgente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => agentesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AGENTES_KEY }),
  })
}

export function useDeleteAgente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: agentesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: AGENTES_KEY }),
  })
}
