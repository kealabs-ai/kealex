import type { Role } from '../types'

export const ROLE_REQUIRED_BY_PATH: Readonly<Record<string, readonly Role[]>> = {
  '/usuarios': ['admin'],
  '/equipe': ['escritorio'],
  '/clientes': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/admin': ['admin'],
  '/gestao/dashboard': ['admin'],
  '/gestao/creditos': ['admin'],
  '/atividades': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/analise-documentos': ['advogado'],
  '/cobranca': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/intimacoes': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/audiencias': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/financeiro': ['admin', 'advogado', 'juridico', 'cliente', 'escritorio'],
  '/prazos': ['admin', 'advogado', 'juridico', 'cliente', 'escritorio'],
  '/processos': ['admin', 'advogado', 'juridico', 'cliente', 'escritorio'],
  '/documentos': ['admin', 'advogado', 'juridico', 'cliente', 'escritorio'],
  '/integracao-orgaos': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/acompanhar-processo': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/kea-store': ['admin', 'advogado', 'juridico', 'escritorio'],
}

export const PLAN_CONTROLLED_MENU_PATHS = new Set([
  '/processos', '/documentos', '/prazos', '/atividades', '/financeiro', '/cobranca', '/usuarios', '/equipe',
  '/clientes', '/intimacoes', '/audiencias', '/integracao-orgaos', '/ia', '/analise-documentos', '/meus-agents', '/configuracoes/ia',
])

export function isRoleAllowed(required: readonly Role[] | undefined, role: Role | null | undefined): boolean {
  if (!required) return true
  return role !== null && role !== undefined && required.includes(role)
}

export function normalizeRolePath(pathname: string): string {
  if (pathname.startsWith('/kea-store/')) return '/kea-store'
  if (pathname === '/certidoes' || pathname.startsWith('/certidoes/')) return '/kea-store'
  if (pathname.startsWith('/integracao-orgaos/')) return '/integracao-orgaos'
  return pathname
}

export function isPlanMenuAllowed(path: string, role: Role | null | undefined, allowedMenus?: readonly string[]): boolean {
  if (path === '/processos' && role === 'advogado') return true
  if (!PLAN_CONTROLLED_MENU_PATHS.has(path)) return true
  return Array.isArray(allowedMenus) && allowedMenus.includes(path)
}
