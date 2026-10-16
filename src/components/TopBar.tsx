import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, ExternalLink, Building2, User, UserRound, AlertCircle, CalendarDays, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useTrial } from '../hooks/useTrial'
import { assinaturaApi, PLANOS_CONFIG } from '../api/assinatura'
import { AssinaturaModal } from './AssinaturaModal'
import { ModalidadeModal } from './ModalidadeModal'
import { Modal } from './Modal'
import { ProfileAvatar } from './ProfileAvatar'
import mascotBanner from '../assets/mascote_kealex_topo.png'

interface TopbarProps {
  title: string
  subtitle?: string | React.ReactNode
  icon?: LucideIcon | React.ReactNode
  actions?: React.ReactNode
  rightContent?: React.ReactNode
  hideModuleBar?: boolean
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

export function TopBar({ title, subtitle, icon, actions, rightContent, hideModuleBar = false }: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showModalidade, setShowModalidade] = useState(false)
  const [showAssinatura, setShowAssinatura] = useState(false)
  const [showExpirationNotice, setShowExpirationNotice] = useState(false)
  const { user, logout } = useAuth()
  const { isTrial, daysLeft } = useTrial()

  const { data: billingStatus } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: Boolean(user && user.role !== 'admin'),
    staleTime: 0,
    refetchInterval: 30_000,
  })

  const isPendingPayment = billingStatus?.status === 'pending'
  const subscriptionExpiresAt = billingStatus?.subscriptionExpiresAt
  const activePlan = billingStatus?.status === 'active' && user?.role !== 'admin'
    ? PLANOS_CONFIG.find((plan) => plan.id === billingStatus.plano)
    : undefined
  const nextRenewalDate = billingStatus?.nextDueDate ?? subscriptionExpiresAt
  const formattedRenewalDate = nextRenewalDate
    ? (() => {
        const [year, month, day] = nextRenewalDate.slice(0, 10).split('-').map(Number)
        return Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
          ? new Date(year, month - 1, day).toLocaleDateString('pt-BR')
          : null
      })()
    : null
  const subscriptionDaysLeft = subscriptionExpiresAt
    ? Math.ceil((new Date(subscriptionExpiresAt).getTime() - Date.now()) / 86_400_000)
    : null
  const isSubscriptionExpiring = billingStatus?.status === 'active'
    && subscriptionDaysLeft !== null
    && subscriptionDaysLeft >= 1
    && subscriptionDaysLeft <= 10

  useEffect(() => {
    if (
      !user?.tenantId
      || billingStatus?.status !== 'active'
      || !subscriptionExpiresAt
      || subscriptionDaysLeft === null
      || subscriptionDaysLeft < 1
      || subscriptionDaysLeft > 10
    ) return

    const noticeKey = `subscription-expiration-notice:${user.tenantId}:${subscriptionExpiresAt}`
    if (sessionStorage.getItem(noticeKey) !== 'shown') setShowExpirationNotice(true)
  }, [billingStatus?.status, subscriptionDaysLeft, subscriptionExpiresAt, user?.tenantId])

  function dismissExpirationNotice() {
    if (user?.tenantId && subscriptionExpiresAt) {
      sessionStorage.setItem(`subscription-expiration-notice:${user.tenantId}:${subscriptionExpiresAt}`, 'shown')
    }
    setShowExpirationNotice(false)
  }

  function openRenewalPayment() {
    dismissExpirationNotice()
    setShowAssinatura(true)
  }

  function handleLogout() {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith('subscription-expiration-notice:'))
      .forEach((key) => sessionStorage.removeItem(key))
    logout()
  }

  const iconEl = icon
    ? React.isValidElement(icon)
      ? icon
      : (() => { const Icon = icon as LucideIcon; return <Icon size={20} className="text-[#087E96] dark:text-[#20B987]" /> })()
    : null

  return (
    <>
      <div className="shrink-0">
        {isPendingPayment && (
          <div className="px-4 py-2 text-xs flex items-center justify-between bg-amber-50 border-b border-amber-200 text-amber-800">
            <span className="flex items-center gap-1.5">
              <AlertCircle size={13} className="shrink-0" />
              <strong>Pagamento pendente.</strong>&nbsp;Seu acesso pode ser suspenso. Regularize agora para continuar usando o Kealex.
            </span>
            <button
              type="button"
              className="font-bold underline ml-3 shrink-0 hover:text-amber-900"
              onClick={() => setShowAssinatura(true)}
            >
              Pagar agora
            </button>
          </div>
        )}

        {!isPendingPayment && isSubscriptionExpiring && subscriptionDaysLeft !== null && (
          <div className="px-4 py-2 text-xs flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 text-amber-900">
            <span className="flex items-center gap-1.5">
              <AlertCircle size={13} className="shrink-0" />
              <span>
                <strong>Sua assinatura expira em {subscriptionDaysLeft} dia{subscriptionDaysLeft === 1 ? '' : 's'}.</strong>
                {' '}Renove para evitar a interrupção do acesso.
              </span>
            </span>
            <button
              type="button"
              className="font-bold underline shrink-0 hover:text-amber-950"
              onClick={openRenewalPayment}
            >
              Renovar agora
            </button>
          </div>
        )}

        {!isPendingPayment && !isSubscriptionExpiring && isTrial && daysLeft !== null && (
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

        <div className={`kea-module-bar bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-white/10 px-6 py-3${hideModuleBar ? ' hidden' : ''}`} style={{ backgroundImage: `url("${mascotBanner}")` }}>
          <div className="flex items-center justify-between">
            {title && <div className="flex items-center gap-3">
              {iconEl}
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
                {subtitle && (
                  typeof subtitle === 'string'
                    ? <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                    : subtitle
                )}
              </div>
            </div>}

            <div className="flex items-center gap-4">
              {rightContent ?? actions}

              {activePlan && (
                <div className="hidden lg:flex items-center gap-2.5 border-l border-[#E2E8F0] dark:border-white/10 pl-4" aria-label="Plano e próxima renovação">
                  <span className="rounded-lg bg-[#087E96]/10 dark:bg-[#087E96]/20 px-2.5 py-1 text-xs font-semibold text-[#087E96] dark:text-[#20B987]">
                    {activePlan.nome}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays size={14} className="text-[#087E96] dark:text-[#20B987]" />
                    <span>Próxima renovação: {formattedRenewalDate ?? 'não informada'}</span>
                  </div>
                </div>
              )}

              {user && user.role !== 'admin' && (
                <button
                  onClick={() => setShowModalidade(true)}
                  title={user.modalidade === 'escritorio' ? 'Associado a escritorio' : 'Modo autonomo'}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#087E96] dark:hover:text-[#20B987] border border-slate-200 dark:border-slate-700 hover:border-[#087E96]/50 px-3 py-1.5 rounded-lg transition-all"
                >
                  {user.modalidade === 'escritorio' ? <Building2 size={12} /> : <User size={12} />}
                  {user.modalidade === 'escritorio' ? 'Escritorio' : 'Autonomo'}
                </button>
              )}

              {user?.role === 'cliente' && (
                <Link
                  to="/"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#087E96] dark:hover:text-[#20B987] border border-slate-200 dark:border-slate-700 hover:border-[#087E96]/50 px-3 py-1.5 rounded-lg transition-all"
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
                    <ProfileAvatar user={user} className="h-10 w-10 rounded-xl text-sm" iconSize={19} />
                    <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.nome}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                        </div>
                        <Link
                          to="/perfil"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <UserRound size={16} className="text-[#087E96] dark:text-[#20B987]" />
                          Edição do perfil
                        </Link>
                        <button
                          onClick={() => { setShowUserMenu(false); handleLogout() }}
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

      <ModalidadeModal
        open={showModalidade}
        onClose={() => setShowModalidade(false)}
        onContinueToPayment={() => setShowAssinatura(true)}
      />
      <AssinaturaModal 
        open={showAssinatura} 
        onClose={() => setShowAssinatura(false)}
      />
      {showExpirationNotice && isSubscriptionExpiring && subscriptionDaysLeft !== null && subscriptionExpiresAt && (
        <Modal
          title="Seu acesso está perto de expirar"
          subtitle="Aviso de vencimento da assinatura"
          onClose={dismissExpirationNotice}
          size="sm"
        >
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Seu acesso à plataforma expirará em <strong className="text-slate-900 dark:text-white">{subscriptionDaysLeft} dia{subscriptionDaysLeft === 1 ? '' : 's'}</strong>,
              {' '}em {new Date(subscriptionExpiresAt).toLocaleDateString('pt-BR')}.
            </p>
            <p>Renove antes dessa data para evitar a interrupção do acesso.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={dismissExpirationNotice}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Depois
              </button>
              <button
                type="button"
                onClick={openRenewalPayment}
                className="flex-1 rounded-xl bg-[#102B46] px-4 py-2.5 font-semibold text-white hover:bg-[#0B2035]"
              >
                Renovar agora
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export { TopBar as Topbar }
