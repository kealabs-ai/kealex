import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Sidebar'
import { useTrial } from '../hooks/useTrial'
import { AssinaturaModal } from './AssinaturaModal'
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
  const { isBlocked } = useTrial()
  const [modalOpen, setModalOpen] = useState(true)

  if (!user) {
    const from = location.pathname !== '/entrar' ? location : undefined
    return <Navigate to="/entrar" state={{ from }} replace />
  }

  // Conta bloqueada (trial expirado, past_due ou pending) → modal de pagamento sobre a tela
  if (isBlocked) {
    return (
      <AssinaturaModal
        open={modalOpen}
        onClose={() => setModalOpen(true)}
        planoInicial="professional"
        obrigatorio
      />
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
