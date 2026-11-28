import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const markdownSource = await readFile(new URL('../src/utils/markdownToHtml.ts', import.meta.url), 'utf8')
const escapeSource = await readFile(new URL('../src/utils/escapeHtmlText.ts', import.meta.url), 'utf8')
const markdownModuleSource = `${escapeSource}\n${markdownSource.replace("import { escapeHtmlText } from './escapeHtmlText'", '')}`
const compiled = ts.transpileModule(markdownModuleSource, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
const { markdownToHtml } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('renders supported Markdown while escaping raw HTML in prose', () => {
  const html = markdownToHtml('# Título\nTexto **forte**, *ênfase*, `código` e [lei](https://example.com).\n<script>alert(1)</script>')

  assert.match(html, /<h1 class="md-h1">Título<\/h1>/)
  assert.match(html, /<strong class="md-bold">forte<\/strong>/)
  assert.match(html, /<em>ênfase<\/em>/)
  assert.match(html, /<code class="md-code">código<\/code>/)
  assert.match(html, /<a href="https:\/\/example\.com" class="md-link">lei<\/a>/)
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.doesNotMatch(html, /<script>/)
})

test('escapes code fence labels and code body before adding markup', () => {
  const html = markdownToHtml('```<img src=x onerror=alert(1)>\n<script>alert(1)</script>\n```')

  assert.match(html, /md-code-lang">&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.match(html, /<code>&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/code>/)
  assert.doesNotMatch(html, /<img|<script>/)
})
