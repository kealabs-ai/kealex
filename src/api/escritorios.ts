import { api } from './client'

export interface Escritorio {
  id: string
  tenantId: string
  nome: string
  cnpj?: string
  endereco?: string
  telefone?: string
  email?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export const escritoriosApi = {
  list: () =>
    api.get<Escritorio[]>('/v1/lex/escritorios').then((r) => r.data),

  get: (id: string) =>
    api.post<Escritorio>('/v1/lex/escritorios/get', { id }).then((r) => r.data),

  create: (data: Omit<Escritorio, 'id' | 'tenantId' | 'ativo' | 'createdAt' | 'updatedAt'>) =>
    api.post<Escritorio>('/v1/lex/escritorios', data).then((r) => r.data),

  update: (id: string, data: Partial<Escritorio>) =>
    api.post<Escritorio>('/v1/lex/escritorios/update', { id, ...data }).then((r) => r.data),

  remove: (id: string) =>
    api.post('/v1/lex/escritorios/delete', { id }).then((r) => r.data),

  // Associa ou desassocia usuário a escritório
  associarMembro: (usuarioId: string, escritorioId: string | null) =>
    api.post('/v1/lex/escritorios/associar-membro', { usuarioId, escritorioId }).then((r) => r.data),
}
