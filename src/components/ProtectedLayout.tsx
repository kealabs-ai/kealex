import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'
import { useTrial } from '../hooks/useTrial'
import { assinaturaApi } from '../api/assinatura'
import type { Role } from '../types'
import { useAIPolicy } from '../hooks/useAIPolicy'

const roleRequired: Record<string, Role[]> = {
  '/usuarios':   ['admin'],
  '/equipe':     ['escritorio'],
  '/clientes':   ['admin', 'advogado', 'juridico', 'escritorio'],
  '/admin':      ['admin'],
  '/analise-documentos': ['advogado'],
  '/cobranca':   ['admin', 'advogado', 'juridico', 'escritorio'],
  '/intimacoes': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/audiencias': ['admin', 'advogado', 'juridico', 'escritorio'],
  '/financeiro': ['admin', 'advogado', 'juridico', 'cliente', 'escritorio'],
  '/prazos':     ['admin', 'advogado', 'juridico', 'cliente', 'escritorio'],
  '/processos':  ['admin', 'advogado', 'juridico', 'cliente', 'escritorio'],
  '/documentos': ['admin', 'advogado', 'juridico', 'cliente', 'escritorio'],
  '/integracao-orgaos': ['admin', 'advogado', 'juridico', 'escritorio'],
}
const planControlledMenus = [
  '/processos', '/documentos', '/prazos', '/atividades', '/financeiro', '/cobranca', '/usuarios', '/equipe',
  '/clientes', '/intimacoes', '/audiencias', '/integracao-orgaos', '/ia', '/analise-documentos', '/meus-agents', '/configuracoes/ia',
]

export function ProtectedLayout() {
  const { user, role } = useAuth()
  const { data: aiPolicy } = useAIPolicy()
  const location = useLocation()
  const trial = useTrial()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('kealex-sidebar-collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: billingStatus } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: Boolean(user && role !== 'admin'),
    staleTime: 0,
    refetchInterval: 30_000,
  })

  if (!user) {
    const from = location.pathname !== '/entrar' ? location : undefined
    return <Navigate to="/entrar" state={{ from }} replace />
  }

  const status = billingStatus?.status
  const isExpired = status
    ? ['trial_expired', 'past_due', 'canceled', 'inactive'].includes(status)
    : trial.isExpired

  // pending: mantém o usuário na plataforma — o banner no TopBar trata o caso
  if (isExpired) return <Navigate to="/trial-expirado" replace />

  const required = roleRequired[location.pathname]
  if (required && role && !required.includes(role)) {
    return <Navigate to="/processos" replace />
  }
  if (location.pathname === '/meus-agents' && role !== 'advogado') return <Navigate to="/processos" replace />
  const planMenuPath = planControlledMenus.includes(location.pathname) ? location.pathname : null
  if (planMenuPath && aiPolicy && !aiPolicy.allowed_menus.includes(planMenuPath)) return <Navigate to="/processos" replace />

  const toggleSidebar = () => {
    setCollapsed((value) => {
      const next = !value
      localStorage.setItem('kealex-sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <div className={`kea-app-shell${collapsed ? ' is-sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onToggle={toggleSidebar} />
      <div className="kea-app-main">
        <AppHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="kea-page-outlet"><Outlet /></main>
      </div>
    </div>
  )
}
