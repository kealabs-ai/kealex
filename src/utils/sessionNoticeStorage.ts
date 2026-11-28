type NoticeStorage = Pick<Storage, 'getItem' | 'setItem' | 'key' | 'length' | 'removeItem'>

export function isNoticeDismissed(key: string, storage?: NoticeStorage): boolean {
  try {
    return (storage ?? window.sessionStorage).getItem(key) === 'shown'
  } catch {
    return false
  }
}

export function dismissNotice(key: string, storage?: NoticeStorage): void {
  try {
    const targetStorage = storage ?? window.sessionStorage
    targetStorage.setItem(key, 'shown')
  } catch {
    // A notice may reappear when session storage is unavailable.
  }
}

export function clearNotices(prefix: string, storage?: NoticeStorage): void {
  try {
    const targetStorage = storage ?? window.sessionStorage
    const keys = Array.from({ length: targetStorage.length }, (_, index) => targetStorage.key(index))
    for (const key of keys) {
      if (key?.startsWith(prefix)) targetStorage.removeItem(key)
    }
  } catch {
    // Session cleanup is best-effort and must not block logout.
  }
}
