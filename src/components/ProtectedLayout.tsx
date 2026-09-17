import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Sidebar'
import { useTrial } from '../hooks/useTrial'
import type { Role } from '../types'
import { AssinaturaModal } from './AssinaturaModal'

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
  const { isExpired } = useTrial()

  if (!user) {
    const from = location.pathname !== '/entrar' ? location : undefined
    return <Navigate to="/entrar" state={{ from }} replace />
  }

  if (isExpired) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
        <AssinaturaModal open={true} onClose={() => undefined} />
      </div>
    )
  }

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
