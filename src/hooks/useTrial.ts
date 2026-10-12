import { useAuth } from '../context/AuthContext'

const TRIAL_DAYS = 7

/** Retorna o estado de acesso do usuário baseado em plano + subscriptionStatus */
export function useTrial() {
  const { user } = useAuth()

  if (!user || user.role === 'admin') {
    return { isTrial: false, isExpired: false, isPending: false, isBlocked: false, daysLeft: null, trialExpiresAt: null }
  }

  const subscriptionStatus = user.subscriptionStatus?.toLowerCase()
  if (user.plano === 'pending') {
    return { isTrial: false, isExpired: false, isPending: true, isBlocked: true, daysLeft: 0, trialExpiresAt: null }
  }

  if (user.plano && user.plano !== 'trial') {
    const isExpired = user.tenantAtivo === false
      || Boolean(subscriptionStatus && subscriptionStatus !== 'active')
    return { isTrial: false, isExpired, isPending: false, daysLeft: null, trialExpiresAt: null }
  }

  if (user.tenantAtivo === false) {
    return { isTrial: true, isExpired: true, isPending: false, daysLeft: 0, trialExpiresAt: user.trialExpiresAt ?? null }
  }

  // Usa trialExpiresAt do backend se disponível, senão calcula por trialStartedAt
  let expiresAt: Date | null = null
  if (user.trialExpiresAt) {
    expiresAt = new Date(user.trialExpiresAt)
  } else if (user.trialStartedAt) {
    expiresAt = new Date(new Date(user.trialStartedAt).getTime() + TRIAL_DAYS * 86400_000)
  }

  if (!expiresAt) {
    return { isTrial: true, isExpired: false, isPending: false, isBlocked: false, daysLeft: TRIAL_DAYS, trialExpiresAt: null }
  }

  const msLeft = expiresAt.getTime() - Date.now()
  const daysLeft = Math.max(0, Math.ceil(msLeft / 86400_000))
  const isExpired = daysLeft === 0
  const isPending = isExpired && subscriptionStatus === 'pending'

  return {
    isTrial: true,
    isExpired: isExpired && !isPending,
    isPending,
    daysLeft,
    trialExpiresAt: expiresAt.toISOString(),
  }
}
