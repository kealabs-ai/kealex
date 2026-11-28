import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')

test('CSP is parsed before external resources while preserving the JSON-LD block', () => {
  const jsonLdStart = html.indexOf('<script type="application/ld+json">')
  const jsonLdEnd = html.indexOf('</script>', jsonLdStart) + '</script>'.length
  const cspStart = html.indexOf('http-equiv="Content-Security-Policy"')
  const fontsStart = html.indexOf('fonts.googleapis.com/css2')
  const appScriptStart = html.indexOf('<script type="module"')

  assert.ok(jsonLdStart >= 0 && jsonLdEnd > jsonLdStart)
  assert.ok(cspStart > jsonLdEnd)
  assert.ok(fontsStart > cspStart)
  assert.ok(appScriptStart > cspStart)

  const cspTag = html.slice(cspStart, html.indexOf('>', cspStart) + 1)
  assert.match(cspTag, /script-src 'self';/)
  assert.doesNotMatch(cspTag, /unsafe-eval/)
  assert.doesNotMatch(cspTag, /script-src[^;]*unsafe-inline/)
})
