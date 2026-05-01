import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentosApi } from '../api/documentos'
import type { Documento } from '../types'

export const DOCUMENTOS_KEY = ['documentos']

export function useDocumentos() {
  return useQuery({ queryKey: DOCUMENTOS_KEY, queryFn: documentosApi.list })
}

export function useDocumentosByProcesso(processoId: string) {
  return useQuery({
    queryKey: [...DOCUMENTOS_KEY, 'processo', processoId],
    queryFn: () => documentosApi.byProcesso(processoId),
    enabled: !!processoId,
  })
}

export function useCreateDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: documentosApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}

export function useUpdateDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Documento> }) => documentosApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}

export function useDeleteDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: documentosApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}
