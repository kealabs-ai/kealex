import { useAuth } from '../context/AuthContext'

const TRIAL_DAYS = 7

export function useTrial() {
  const { user } = useAuth()

  // admin nunca é bloqueado; plano pago também não
  if (!user || user.role === 'admin' || (user.plano && user.plano !== 'trial')) {
    return { isTrial: false, isExpired: false, daysLeft: null }
  }

  // sem trialStartedAt → considera trial recém-iniciado (dia 0)
  if (!user.trialStartedAt) {
    return { isTrial: true, isExpired: false, daysLeft: TRIAL_DAYS }
  }

  const start = new Date(user.trialStartedAt).getTime()
  const elapsed = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24))
  const daysLeft = Math.max(0, TRIAL_DAYS - elapsed)

  return {
    isTrial: true,
    isExpired: daysLeft === 0,
    daysLeft,
  }
}
