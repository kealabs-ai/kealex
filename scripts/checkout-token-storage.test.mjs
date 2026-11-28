import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/checkoutTokenStorage.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { clearCheckoutToken, readCheckoutToken, saveCheckoutToken } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`,
)

test('saves, reads, and clears the temporary checkout token in session storage', () => {
  const values = new Map()
  globalThis.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }

  assert.equal(saveCheckoutToken('short-lived-registration-token'), true)
  assert.equal(readCheckoutToken(), 'short-lived-registration-token')
  clearCheckoutToken()
  assert.equal(readCheckoutToken(), null)
})

test('reads as absent and clears best-effort when session storage is unavailable', () => {
  globalThis.sessionStorage = {
    getItem: () => { throw new Error('storage disabled') },
    setItem: () => { throw new Error('storage disabled') },
    removeItem: () => { throw new Error('storage disabled') },
  }

  assert.equal(readCheckoutToken(), null)
  assert.doesNotThrow(clearCheckoutToken)
  assert.equal(saveCheckoutToken('token'), false)
})
