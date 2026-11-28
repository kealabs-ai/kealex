const CHECKOUT_TOKEN_KEY = 'kealex_checkout_token'

export function saveCheckoutToken(token: string): boolean {
  try {
    sessionStorage.setItem(CHECKOUT_TOKEN_KEY, token)
    return true
  } catch {
    return false
  }
}

export function readCheckoutToken(): string | null {
  try {
    return sessionStorage.getItem(CHECKOUT_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearCheckoutToken(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_TOKEN_KEY)
  } catch {
    // Keep checkout cleanup best-effort when browser storage is unavailable.
  }
}
