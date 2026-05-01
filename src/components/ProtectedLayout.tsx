import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Sidebar'
import type { Role } from '../types'

const roleRequired: Record<string, Role[]> = {
  '/usuarios': ['admin'],
  '/admin': ['admin'],
  '/financeiro': ['admin', 'advogado'],
  '/prazos': ['admin', 'advogado'],
}

export function ProtectedLayout() {
  const { user, role } = useAuth()
  const location = useLocation()

  if (!user) {
    const from = location.pathname !== '/login' ? location : undefined
    return <Navigate to="/login" state={{ from }} replace />
  }

  const required = roleRequired[location.pathname]
  if (required && role && !required.includes(role)) {
    return <Navigate to="/processos" replace />
  }

  return (
    <div className="flex min-h-screen mesh-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
