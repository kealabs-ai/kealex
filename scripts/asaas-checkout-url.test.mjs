import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/asaasCheckoutUrl.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { safeAsaasCheckoutUrl } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('accepts HTTPS checkout URLs on Asaas and its subdomains', () => {
  assert.equal(safeAsaasCheckoutUrl('https://asaas.com/checkout?id=123'), 'https://asaas.com/checkout?id=123')
  assert.equal(safeAsaasCheckoutUrl('https://www.asaas.com/checkout?id=123'), 'https://www.asaas.com/checkout?id=123')
  assert.equal(safeAsaasCheckoutUrl('https://sandbox.asaas.com/checkout'), 'https://sandbox.asaas.com/checkout')
})

test('rejects lookalike hosts, credentials, non-HTTPS schemes, and nonstandard ports', () => {
  assert.equal(safeAsaasCheckoutUrl('https://asaas.com.attacker.test/checkout'), null)
  assert.equal(safeAsaasCheckoutUrl('https://notasaas.com/checkout'), null)
  assert.equal(safeAsaasCheckoutUrl('https://user:secret@asaas.com/checkout'), null)
  assert.equal(safeAsaasCheckoutUrl('http://asaas.com/checkout'), null)
  assert.equal(safeAsaasCheckoutUrl('https://asaas.com:8443/checkout'), null)
  assert.equal(safeAsaasCheckoutUrl('javascript:alert(1)'), null)
  assert.equal(safeAsaasCheckoutUrl(''), null)
})
