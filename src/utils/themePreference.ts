export type ThemePreference = 'dark' | 'light'
type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>
const KEY = 'kealex-theme'

export function readThemePreference(storage?: PreferenceStorage): ThemePreference {
  try {
    const value = (storage ?? window.localStorage).getItem(KEY)
    return value === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function writeThemePreference(theme: ThemePreference, storage?: PreferenceStorage): void {
  try {
    const targetStorage = storage ?? window.localStorage
    targetStorage.setItem(KEY, theme)
  } catch {
    // Theme persistence is optional; the in-memory theme remains active.
  }
}
