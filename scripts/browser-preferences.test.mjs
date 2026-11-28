import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

async function loadUtility(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
}

const theme = await loadUtility('../src/utils/themePreference.ts')
const consent = await loadUtility('../src/utils/cookieConsentStorage.ts')
const notices = await loadUtility('../src/utils/sessionNoticeStorage.ts')

test('theme storage falls back safely and preserves valid values', () => {
  const values = new Map([['kealex-theme', 'light']])
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  assert.equal(theme.readThemePreference(storage), 'light')
  assert.equal(theme.readThemePreference({ getItem: () => 'invalid', setItem() {} }), 'dark')
  assert.equal(theme.readThemePreference({ getItem() { throw Error() }, setItem() {} }), 'dark')
  assert.doesNotThrow(() => theme.writeThemePreference('dark', { getItem() { throw Error() }, setItem() { throw Error() } }))
})

test('cookie consent accepts only valid persisted choices', () => {
  const storage = { getItem: () => JSON.stringify({ analytics: false, functional: true }), setItem() {} }
  assert.equal(consent.hasSavedCookieConsent(storage), true)
  assert.equal(consent.hasSavedCookieConsent({ getItem: () => 'invalid', setItem() {} }), false)
  assert.equal(consent.hasSavedCookieConsent({ getItem: () => JSON.stringify({ analytics: 'yes', functional: true }), setItem() {} }), false)
  assert.equal(consent.hasSavedCookieConsent({ getItem() { throw Error() }, setItem() {} }), false)
  assert.equal(consent.saveCookieConsent({ analytics: false, functional: false }, { getItem() {}, setItem() { throw Error() } }), false)
})

test('session notice storage failures never block UI actions', () => {
  const storage = new Map()
  const adapter = {
    get length() { return storage.size },
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    key: (index) => [...storage.keys()][index] ?? null,
    removeItem: (key) => storage.delete(key),
  }
  notices.dismissNotice('notice:one', adapter)
  assert.equal(notices.isNoticeDismissed('notice:one', adapter), true)
  notices.clearNotices('notice:', adapter)
  assert.equal(notices.isNoticeDismissed('notice:one', adapter), false)
  assert.equal(notices.isNoticeDismissed('notice:one', { getItem() { throw Error() }, setItem() {}, key() {}, length: 0, removeItem() {} }), false)
  assert.doesNotThrow(() => notices.clearNotices('notice:', { getItem() {}, setItem() {}, key() { throw Error() }, length: 1, removeItem() {} }))
})
