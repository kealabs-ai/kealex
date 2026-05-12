import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesApi } from '../api/clientes'
import type { Cliente } from '../types'

const KEY = ['clientes']

export const useClientes = () => useQuery({ queryKey: KEY, queryFn: clientesApi.list })

export const useCreateCliente = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clientesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export const useUpdateCliente = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cliente> }) => clientesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export const useDeleteCliente = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clientesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
