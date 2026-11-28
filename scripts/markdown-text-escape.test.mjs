import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/escapeHtmlText.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { escapeHtmlText } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('escapes HTML metacharacters before untrusted text enters generated markup', () => {
  assert.equal(escapeHtmlText(`<img src=x onerror="alert('x')"> & text`), '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt; &amp; text')
})

test('escapes existing entities without turning them into markup', () => {
  assert.equal(escapeHtmlText('&lt;script&gt;'), '&amp;lt;script&amp;gt;')
})
