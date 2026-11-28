import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/documentUrls.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { privateDocumentFileMatch } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('accepts only the authenticated private file endpoint format', () => {
  assert.equal(privateDocumentFileMatch('/v1/lex/arquivos/123e4567-e89b-12d3-a456-426614174000')?.[1], '123e4567-e89b-12d3-a456-426614174000')
  assert.equal(privateDocumentFileMatch('https://cdn.kealex.com.br/docs/arquivo.pdf'), null)
  assert.equal(privateDocumentFileMatch('https://docs.example.test/file.pdf'), null)
  assert.equal(privateDocumentFileMatch('/v1/lex/arquivos/not-a-uuid'), null)
  assert.equal(privateDocumentFileMatch('/v1/lex/arquivos/------------------------------------'), null)
})

test('rejects external and non-HTTP document references', () => {
  assert.equal(privateDocumentFileMatch('javascript:alert(1)'), null)
  assert.equal(privateDocumentFileMatch('data:text/html,privado'), null)
  assert.equal(privateDocumentFileMatch('https://user:password@docs.example.test/file.pdf'), null)
})
