import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/sidebarPreference.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { readSidebarCollapsed, writeSidebarCollapsed } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('reads and writes the optional sidebar preference', () => {
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  assert.equal(readSidebarCollapsed(storage), false)
  writeSidebarCollapsed(true, storage)
  assert.equal(readSidebarCollapsed(storage), true)
})

test('storage failures do not break the app shell', () => {
  const storage = {
    getItem: () => { throw new Error('storage denied') },
    setItem: () => { throw new Error('storage denied') },
  }
  assert.equal(readSidebarCollapsed(storage), false)
  assert.doesNotThrow(() => writeSidebarCollapsed(true, storage))
})
