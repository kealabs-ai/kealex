import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'
import { useTrial } from '../hooks/useTrial'
import { assinaturaApi } from '../api/assinatura'
import type { Role } from '../types'

const roleRequired: Record<string, Role[]> = {
  '/usuarios':   ['admin'],
  '/equipe':     ['escritorio'],
  '/clientes':   ['admin', 'advogado', 'juridico'],
  '/admin':      ['admin'],
  '/cobranca':   ['admin', 'advogado', 'juridico'],
  '/intimacoes': ['admin', 'advogado', 'juridico'],
  '/audiencias': ['admin', 'advogado', 'juridico'],
  '/financeiro': ['admin', 'advogado', 'juridico', 'cliente'],
  '/prazos':     ['admin', 'advogado', 'juridico', 'cliente'],
  '/processos':  ['admin', 'advogado', 'juridico', 'cliente'],
  '/documentos': ['admin', 'advogado', 'juridico', 'cliente'],
}

export function ProtectedLayout() {
  const { user, role } = useAuth()
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

  if (role === 'escritorio' && location.pathname !== '/equipe') {
    return <Navigate to="/equipe" replace />
  }

  const required = roleRequired[location.pathname]
  if (required && role && !required.includes(role)) {
    return <Navigate to="/processos" replace />
  }

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
