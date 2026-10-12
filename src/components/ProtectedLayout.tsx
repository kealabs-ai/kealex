import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Sidebar'
import { useTrial } from '../hooks/useTrial'
import { assinaturaApi } from '../api/assinatura'
import type { Role } from '../types'

const roleRequired: Record<string, Role[]> = {
  '/usuarios':   ['admin'],
  '/clientes':   ['admin', 'advogado'],
  '/admin':      ['admin'],
  '/cobranca':   ['admin', 'advogado'],
  '/intimacoes': ['admin', 'advogado'],
  '/audiencias': ['admin', 'advogado'],
  '/financeiro': ['admin', 'advogado', 'cliente'],
  '/prazos':     ['admin', 'advogado', 'cliente'],
  '/processos':  ['admin', 'advogado', 'cliente'],
  '/documentos': ['admin', 'advogado', 'cliente'],
}

export function ProtectedLayout() {
  const { user, role } = useAuth()
  const location = useLocation()
  const trial = useTrial()
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
  const isPending = status ? status === 'pending' : trial.isPending
  const isExpired = status
    ? ['trial_expired', 'past_due', 'canceled', 'inactive'].includes(status)
    : trial.isExpired

  if (isPending) return <Navigate to="/pagamento-pendente" replace />

  if (isExpired) return <Navigate to="/trial-expirado" replace />

  const required = roleRequired[location.pathname]
  if (required && role && !required.includes(role)) {
    return <Navigate to="/processos" replace />
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
  )
}
