import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { escritoriosApi, type Escritorio } from '../api/escritorios'

export const ESCRITORIOS_KEY = ['escritorios']

export function useEscritorios() {
  return useQuery({ queryKey: ESCRITORIOS_KEY, queryFn: escritoriosApi.list })
}

export function useCreateEscritorio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: escritoriosApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ESCRITORIOS_KEY }),
  })
}

export function useCreateEscritorioAccess() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: escritoriosApi.createAccess,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ESCRITORIOS_KEY }),
  })
}

export function useUpdateEscritorio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Escritorio> }) => escritoriosApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ESCRITORIOS_KEY }),
  })
}
