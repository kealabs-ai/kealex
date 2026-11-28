type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>
const KEY = 'kealex-sidebar-collapsed'

export function readSidebarCollapsed(storage?: PreferenceStorage): boolean {
  try {
    return (storage ?? window.localStorage).getItem(KEY) === 'true'
  } catch {
    return false
  }
}

export function writeSidebarCollapsed(collapsed: boolean, storage?: PreferenceStorage): void {
  try {
    const targetStorage = storage ?? window.localStorage
    targetStorage.setItem(KEY, String(collapsed))
  } catch {
    // Sidebar preference is optional; storage failures must not break navigation.
  }
}
