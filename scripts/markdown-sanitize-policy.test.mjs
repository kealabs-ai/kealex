import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/markdownSanitizePolicy.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { MARKDOWN_SANITIZE_OPTIONS } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('keeps Markdown links in the current tab and blocks event-capable attributes', () => {
  assert.deepEqual(MARKDOWN_SANITIZE_OPTIONS.ALLOWED_ATTR, ['class', 'href'])
  assert.equal(MARKDOWN_SANITIZE_OPTIONS.ALLOW_DATA_ATTR, false)
  assert.ok(!MARKDOWN_SANITIZE_OPTIONS.ALLOWED_ATTR.includes('target'))
  assert.ok(!MARKDOWN_SANITIZE_OPTIONS.ALLOWED_ATTR.includes('rel'))
})

test('allows only the renderer’s presentational HTML elements', () => {
  const allowedTags = MARKDOWN_SANITIZE_OPTIONS.ALLOWED_TAGS
  for (const tag of ['script', 'style', 'iframe', 'object', 'svg', 'img', 'form']) {
    assert.ok(!allowedTags.includes(tag), `${tag} must not be allowed`)
  }
  assert.ok(allowedTags.includes('a'))
})
