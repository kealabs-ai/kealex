import { api } from './client'

const ESCRITORIOS_API_BASE_URL = import.meta.env.KEALEX_API_BASE_URL || 'https://srv1023256.hstgr.cloud'

const postEscritorio = <T,>(path: string, data: unknown) =>
  api.post<T>(path, data, { baseURL: ESCRITORIOS_API_BASE_URL }).then((r) => r.data)

export interface Escritorio {
  id: string
  codigo: string
  tenantId: string
  nome: string
  cnpj?: string
  endereco?: string
  telefone?: string
  email?: string
  ativo: boolean
  limiteAdvogados: number
  usuariosAtivos: number
  advogadosAtivos: number
  acessoConfigurado?: boolean
  createdAt: string
  updatedAt: string
}

export const escritoriosApi = {
  list: () =>
    api.get<Escritorio[]>('/v1/lex/escritorios', { baseURL: ESCRITORIOS_API_BASE_URL }).then((r) => r.data),

  get: (id: string) =>
    postEscritorio<Escritorio>('/v1/lex/escritorios/get', { id }),

  create: (data: Omit<Escritorio, 'id' | 'codigo' | 'tenantId' | 'ativo' | 'usuariosAtivos' | 'advogadosAtivos' | 'createdAt' | 'updatedAt'> & { emailAcesso: string; senhaInicial: string }) =>
    postEscritorio<Escritorio>('/v1/lex/escritorios', data),

  createAccess: (data: { escritorioId: string; emailAcesso: string; senhaInicial: string }) =>
    postEscritorio('/v1/lex/escritorios/criar-acesso', data),

  update: (id: string, data: Partial<Escritorio>) =>
    postEscritorio<Escritorio>('/v1/lex/escritorios/update', { id, ...data }),

  remove: (id: string) =>
    postEscritorio('/v1/lex/escritorios/delete', { id }),

  // Associa ou desassocia usuário a escritório
  associarMembro: (usuarioId: string, escritorioId: string | null) =>
    postEscritorio('/v1/lex/escritorios/associar-membro', { usuarioId, escritorioId }),
}
