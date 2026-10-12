import { useAuth } from '../context/AuthContext'

const TRIAL_DAYS = 7

/** Retorna o estado de acesso do usuário baseado em plano + subscriptionStatus */
export function useTrial() {
  const { user } = useAuth()

  if (!user || user.role === 'admin') {
    return { isTrial: false, isExpired: false, isPending: false, isBlocked: false, daysLeft: null, trialExpiresAt: null }
  }

  const subStatus = (user.subscriptionStatus ?? '').toLowerCase()

  // Plano pago ativo
  if (user.plano && !['trial', 'pending'].includes(user.plano)) {
    // past_due = assinatura vencida → bloqueia
    if (subStatus === 'past_due') {
      return { isTrial: false, isExpired: false, isPending: false, isBlocked: true, daysLeft: null, trialExpiresAt: null }
    }
    return { isTrial: false, isExpired: false, isPending: false, isBlocked: false, daysLeft: null, trialExpiresAt: null }
  }

  // Plano pending = assinatura criada mas pagamento não confirmado
  if (user.plano === 'pending') {
    return { isTrial: false, isExpired: false, isPending: true, isBlocked: true, daysLeft: 0, trialExpiresAt: null }
  }

  // Trial
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

  return {
    isTrial: true,
    isExpired,
    isPending: false,
    isBlocked: isExpired,
    daysLeft,
    trialExpiresAt: expiresAt.toISOString(),
  }
}
