import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test, { afterEach } from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/authSessionStorage.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const authSessionStorage = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const originalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

function installStorage(storage) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
}

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

function createToken(exp) {
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url')
  return `header.${payload}.signature`
}

afterEach(() => {
  if (originalStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', originalStorageDescriptor)
  } else {
    delete globalThis.localStorage
  }
})

test('reads and saves an access token', () => {
  const values = new Map()
  installStorage({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  })

  authSessionStorage.saveAccessToken('session-token')

  assert.equal(authSessionStorage.readAccessToken(), 'session-token')
})

test('fails closed when storage reads are unavailable', () => {
  installStorage({ getItem() { throw new Error('storage unavailable') } })

  assert.equal(authSessionStorage.readAccessToken(), null)
})

test('continues clearing the profile if removing the token throws', () => {
  const attemptedKeys = []
  installStorage({
    removeItem(key) {
      attemptedKeys.push(key)
      if (key === 'kealex_token') throw new Error('storage unavailable')
    },
  })

  authSessionStorage.clearStoredSession()

  assert.deepEqual(attemptedKeys, ['kealex_token', 'kealex_user'])
})

test('restores a valid session and removes the legacy duplicated token from the profile', () => {
  const token = createToken(Math.floor(Date.now() / 1000) + 3600)
  const storage = createStorage({
    kealex_token: token,
    kealex_user: JSON.stringify({ id: 'user-1', name: 'Ana', accessToken: 'legacy-token' }),
  })
  installStorage(storage)

  const restored = authSessionStorage.restoreStoredSession()

  assert.equal(restored.id, 'user-1')
  assert.equal(restored.accessToken, token)
  assert.deepEqual(JSON.parse(storage.values.get('kealex_user')), { id: 'user-1', name: 'Ana' })
})

test('clears token and profile when the token is expired', () => {
  const storage = createStorage({
    kealex_token: createToken(Math.floor(Date.now() / 1000) - 1),
    kealex_user: JSON.stringify({ id: 'user-1' }),
  })
  installStorage(storage)

  assert.equal(authSessionStorage.restoreStoredSession(), null)
  assert.equal(storage.values.size, 0)
})

test('clears token and profile when the profile JSON is malformed', () => {
  const storage = createStorage({
    kealex_token: createToken(Math.floor(Date.now() / 1000) + 3600),
    kealex_user: '{invalid-json',
  })
  installStorage(storage)

  assert.equal(authSessionStorage.restoreStoredSession(), null)
  assert.equal(storage.values.size, 0)
})

test('clears token and profile when the profile has no user id', () => {
  const storage = createStorage({
    kealex_token: createToken(Math.floor(Date.now() / 1000) + 3600),
    kealex_user: JSON.stringify({ name: 'Ana' }),
  })
  installStorage(storage)

  assert.equal(authSessionStorage.restoreStoredSession(), null)
  assert.equal(storage.values.size, 0)
})

test('clears an orphan token when the profile is absent', () => {
  const storage = createStorage({ kealex_token: createToken(Math.floor(Date.now() / 1000) + 3600) })
  installStorage(storage)

  assert.equal(authSessionStorage.restoreStoredSession(), null)
  assert.equal(storage.values.size, 0)
})
