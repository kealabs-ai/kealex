import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, type LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface TopbarProps {
  title: string
  subtitle: string | React.ReactNode
  icon: LucideIcon
  actions?: React.ReactNode
}

export function Topbar({ title, subtitle, icon: Icon, actions }: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()

  const initials = user?.nome?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'

  return (
    <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-indigo-600" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            {typeof subtitle === 'string' ? (
              <p className="text-xs text-gray-500">{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {actions}

          {/* Avatar e Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.nome}</p>
                <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrador' : user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold text-white shadow-md">
                {initials}
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.nome}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}