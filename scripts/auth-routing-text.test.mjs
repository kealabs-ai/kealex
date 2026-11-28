import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/authRoutingText.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { readAuthRoutingText } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('reads only string messages used by auth routing', () => {
  assert.equal(readAuthRoutingText({ message: 'Unauthorized' }, 'message'), 'Unauthorized')
  assert.equal(readAuthRoutingText({ detail: 'Conta inativa.' }, 'detail'), 'Conta inativa.')
})

test('fails closed for malformed, missing, and non-string response fields', () => {
  assert.equal(readAuthRoutingText(null, 'message'), '')
  assert.equal(readAuthRoutingText('unauthorized', 'message'), '')
  assert.equal(readAuthRoutingText({ message: { text: 'token' } }, 'message'), '')
  assert.equal(readAuthRoutingText({ detail: ['Conta inativa'] }, 'detail'), '')
})
