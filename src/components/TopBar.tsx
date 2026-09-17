import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, ExternalLink, Building2, User, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTrial } from '../hooks/useTrial'
import { AssinaturaModal } from './AssinaturaModal'
import { ModalidadeModal } from './ModalidadeModal'

interface TopbarProps {
  title: string
  subtitle?: string | React.ReactNode
  icon?: LucideIcon | React.ReactNode
  actions?: React.ReactNode
  rightContent?: React.ReactNode
}

function trialBannerClass(daysLeft: number): string {
  if (daysLeft === 0) return 'px-4 py-2 text-xs flex items-center justify-between bg-red-50 border-b border-red-200 text-red-800'
  if (daysLeft <= 3) return 'px-4 py-2 text-xs flex items-center justify-between bg-amber-50 border-b border-amber-200 text-amber-800'
  return 'px-4 py-2 text-xs flex items-center justify-between bg-blue-50 border-b border-blue-200 text-blue-800'
}

function trialBannerText(daysLeft: number): string {
  if (daysLeft === 0) return 'Seu trial expirou hoje.'
  if (daysLeft <= 3) return 'Seu trial expira em '
  return 'Trial gratuito ativo - '
}

export function TopBar({ title, subtitle, icon, actions, rightContent }: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showModalidade, setShowModalidade] = useState(false)
  const [showAssinatura, setShowAssinatura] = useState(false)
  const { user, logout } = useAuth()
  const { isTrial, daysLeft } = useTrial()

  const initials = user?.nome?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'

  const iconEl = icon
    ? React.isValidElement(icon)
      ? icon
      : (() => { const Icon = icon as LucideIcon; return <Icon size={20} className="text-indigo-600 dark:text-indigo-400" /> })()
    : null

  return (
    <>
      <div className="shrink-0">
        {isTrial && daysLeft !== null && (
          <div className={trialBannerClass(daysLeft)}>
            <span>
              {trialBannerText(daysLeft)}
              {daysLeft > 0 && (
                <strong>{daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}</strong>
              )}
            </span>
            <button
              type="button"
              className="font-bold underline ml-2 shrink-0"
              onClick={() => setShowAssinatura(true)}
            >
              Assinar agora
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
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

              {user && user.role !== 'admin' && (
                <button
                  onClick={() => setShowModalidade(true)}
                  title={user.modalidade === 'escritorio' ? 'Associado a escritorio' : 'Modo autonomo'}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00C2A8] border border-slate-200 dark:border-slate-700 hover:border-[#00C2A8]/50 px-3 py-1.5 rounded-lg transition-all"
                >
                  {user.modalidade === 'escritorio' ? <Building2 size={12} /> : <User size={12} />}
                  {user.modalidade === 'escritorio' ? 'Escritorio' : 'Autonomo'}
                </button>
              )}

              {user?.role === 'cliente' && (
                <Link
                  to="/"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00C2A8] border border-slate-200 dark:border-slate-700 hover:border-[#00C2A8]/50 px-3 py-1.5 rounded-lg transition-all"
                >
                  <ExternalLink size={12} /> Voltar ao site
                </Link>
              )}

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
      </div>

      <ModalidadeModal open={showModalidade} onClose={() => setShowModalidade(false)} />
      <AssinaturaModal open={showAssinatura} onClose={() => setShowAssinatura(false)} />
    </>
  )
}

export { TopBar as Topbar }
