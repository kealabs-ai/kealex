import { useAuth } from '../context/AuthContext'

const TRIAL_DAYS = 7

export function useTrial() {
  const { user } = useAuth()

  if (!user || user.role === 'admin') {
    return { isTrial: false, isExpired: false, daysLeft: null, trialExpiresAt: null }
  }

  // Plano ativo libera acesso imediatamente
  if (user.plano && !['trial', 'pending'].includes(user.plano)) {
    return { isTrial: false, isExpired: false, daysLeft: null, trialExpiresAt: null }
  }

  // Plano pending = assinatura criada mas pagamento não confirmado
  if (user.plano === 'pending') {
    return { isTrial: false, isExpired: true, daysLeft: 0, trialExpiresAt: null }
  }

  // Usa trialExpiresAt do backend se disponível, senão calcula por trialStartedAt
  let expiresAt: Date | null = null
  if (user.trialExpiresAt) {
    expiresAt = new Date(user.trialExpiresAt)
  } else if (user.trialStartedAt) {
    expiresAt = new Date(new Date(user.trialStartedAt).getTime() + TRIAL_DAYS * 86400_000)
  }

  if (!expiresAt) {
    return { isTrial: true, isExpired: false, daysLeft: TRIAL_DAYS, trialExpiresAt: null }
  }

  const msLeft = expiresAt.getTime() - Date.now()
  const daysLeft = Math.max(0, Math.ceil(msLeft / 86400_000))

  return {
    isTrial: true,
    isExpired: daysLeft === 0,
    daysLeft,
    trialExpiresAt: expiresAt.toISOString(),
  }
}
