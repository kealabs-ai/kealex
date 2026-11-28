import type { AuthUser } from '../types'

const ACCESS_TOKEN_KEY = 'kealex_token'
const USER_PROFILE_KEY = 'kealex_user'

export function isTokenValid(token: string): boolean {
  try {
    const segments = token.split('.')
    if (segments.length !== 3 || !segments[1]) return false
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes))
    return Number.isFinite(payload.exp) && payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function saveUserProfile(user: AuthUser): void {
  const profile = { ...user } as Partial<AuthUser>
  delete profile.accessToken
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
}

export function readAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearStoredSession(): void {
  for (const key of [ACCESS_TOKEN_KEY, USER_PROFILE_KEY]) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Keep clearing the other session key when one storage operation fails.
    }
  }
}

export function restoreStoredSession(): AuthUser | null {
  try {
    const token = readAccessToken()
    const stored = localStorage.getItem(USER_PROFILE_KEY)
    if (!token || !stored || !isTokenValid(token)) {
      clearStoredSession()
      return null
    }
    const storedProfile = JSON.parse(stored) as Partial<AuthUser>
    if (!storedProfile || typeof storedProfile !== 'object' || !storedProfile.id) {
      clearStoredSession()
      return null
    }
    const user = { ...storedProfile, accessToken: token } as AuthUser
    if ('accessToken' in storedProfile) saveUserProfile(user)
    return user
  } catch {
    clearStoredSession()
    return null
  }
}
