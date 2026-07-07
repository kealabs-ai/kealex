import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, type LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface TopbarProps {
  title: string
  subtitle?: string | React.ReactNode
  icon?: LucideIcon | React.ReactNode
  actions?: React.ReactNode
  rightContent?: React.ReactNode
}

export function TopBar({ title, subtitle, icon, actions, rightContent }: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()

  const initials = user?.nome?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'

  const iconEl = icon
    ? React.isValidElement(icon)
      ? icon
      : (() => { const Icon = icon as LucideIcon; return <Icon size={20} className="text-indigo-600 dark:text-indigo-400" /> })()
    : null

  return (
    <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {iconEl}
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
            {subtitle && (
              typeof subtitle === 'string'
                ? <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                : subtitle
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {rightContent ?? actions}

          {/* Avatar e Menu — só mostra se não vier no rightContent */}
          {!rightContent && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.nome}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role === 'admin' ? 'Administrador' : user?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-indigo-600 dark:to-violet-700 flex items-center justify-center text-sm font-bold text-white shadow-md">
                  {initials}
                </div>
                <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.nome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setShowUserMenu(false); logout() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { TopBar as Topbar }
