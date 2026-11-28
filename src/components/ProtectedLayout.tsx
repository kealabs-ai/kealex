import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/useAuth'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'
import { useTrial } from '../hooks/useTrial'
import { assinaturaApi } from '../api/assinatura'
import { useAIPolicy } from '../hooks/useAIPolicy'
import { isPlanMenuAllowed, isRoleAllowed, normalizeRolePath, PLAN_CONTROLLED_MENU_PATHS, ROLE_REQUIRED_BY_PATH } from '../utils/roleAccess'
import { readSidebarCollapsed, writeSidebarCollapsed } from '../utils/sidebarPreference'

export function ProtectedLayout() {
  const { user, role } = useAuth()
  const { data: aiPolicy, isLoading: isLoadingAIPolicy } = useAIPolicy()
  const location = useLocation()
  const trial = useTrial()
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed)
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

  const requiredPath = normalizeRolePath(location.pathname)
  const required = ROLE_REQUIRED_BY_PATH[requiredPath]
  if (!isRoleAllowed(required, role)) {
    return <Navigate to="/processos" replace />
  }
  if (location.pathname === '/meus-agents' && role !== 'advogado') return <Navigate to="/processos" replace />
  const planMenuPath = PLAN_CONTROLLED_MENU_PATHS.has(location.pathname) ? location.pathname : null
  if (planMenuPath && !aiPolicy && isLoadingAIPolicy) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500" role="status" aria-busy="true">Carregando permissões de acesso…</div>
  }
  if (planMenuPath && !isPlanMenuAllowed(planMenuPath, role, aiPolicy?.allowed_menus)) {
    return <Navigate to={planMenuPath === '/processos' ? '/perfil' : '/processos'} replace />
  }

  const toggleSidebar = () => {
    setCollapsed((value) => {
      const next = !value
      writeSidebarCollapsed(next)
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
