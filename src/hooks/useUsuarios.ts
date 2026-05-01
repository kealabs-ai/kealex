import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'
import type { Role, Usuario } from '../types'

export const USUARIOS_KEY = ['usuarios']

export function useUsuarios(role?: Role) {
  return useQuery({ queryKey: [...USUARIOS_KEY, role], queryFn: () => usuariosApi.list(role) })
}

export function useCreateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: usuariosApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}

export function useUpdateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Usuario & { senha?: string }> }) =>
      usuariosApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}

export function useDeleteUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: usuariosApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}
