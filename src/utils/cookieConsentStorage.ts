export type CookieConsentValue = { analytics: boolean; functional: boolean }
type ConsentStorage = Pick<Storage, 'getItem' | 'setItem'>
const KEY = 'kealex_cookie_consent'

export function hasSavedCookieConsent(storage?: ConsentStorage): boolean {
  try {
    const stored = (storage ?? window.localStorage).getItem(KEY)
    if (!stored) return false
    const value: unknown = JSON.parse(stored)
    return Boolean(
      value && typeof value === 'object'
      && typeof (value as CookieConsentValue).analytics === 'boolean'
      && typeof (value as CookieConsentValue).functional === 'boolean',
    )
  } catch {
    return false
  }
}

export function saveCookieConsent(consent: CookieConsentValue, storage?: ConsentStorage): boolean {
  try {
    const targetStorage = storage ?? window.localStorage
    targetStorage.setItem(KEY, JSON.stringify(consent))
    return true
  } catch {
    return false
  }
}
