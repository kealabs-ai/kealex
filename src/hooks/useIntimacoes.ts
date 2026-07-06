import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { Intimacao, Audiencia } from '../types'

// Intimações
export function useIntimacoes() {
  return useQuery({
    queryKey: ['intimacoes'],
    queryFn: async () => {
      const { data } = await api.get('/intimacoes')
      return data as Intimacao[]
    },
  })
}

export function useCreateIntimacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Intimacao, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: res } = await api.post('/intimacoes', data)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['intimacoes'] }),
  })
}

export function useUpdateIntimacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Intimacao> }) => {
      const { data: res } = await api.patch(`/intimacoes/${id}`, data)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['intimacoes'] }),
  })
}

export function useDeleteIntimacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/intimacoes/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['intimacoes'] }),
  })
}

// Audiências
export function useAudiencias() {
  return useQuery({
    queryKey: ['audiencias'],
    queryFn: async () => {
      const { data } = await api.get('/audiencias')
      return data as Audiencia[]
    },
  })
}

export function useCreateAudiencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Audiencia, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: res } = await api.post('/audiencias', data)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audiencias'] }),
  })
}

export function useUpdateAudiencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Audiencia> }) => {
      const { data: res } = await api.patch(`/audiencias/${id}`, data)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audiencias'] }),
  })
}

export function useDeleteAudiencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/audiencias/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audiencias'] }),
  })
}
