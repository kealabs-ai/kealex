import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/roleAccess.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { isPlanMenuAllowed, isRoleAllowed, normalizeRolePath, ROLE_REQUIRED_BY_PATH } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('allows unrestricted routes and explicitly permitted roles', () => {
  assert.equal(isRoleAllowed(undefined, null), true)
  assert.equal(isRoleAllowed(['admin', 'advogado'], 'advogado'), true)
})

test('denies missing, unknown, and disallowed roles for restricted routes', () => {
  assert.equal(isRoleAllowed(['admin'], null), false)
  assert.equal(isRoleAllowed(['admin'], undefined), false)
  assert.equal(isRoleAllowed(['admin'], 'cliente'), false)
})

test('applies base route policies to nested routes', () => {
  const consulta = normalizeRolePath('/integracao-orgaos/tribunais-superiores')
  assert.equal(consulta, '/integracao-orgaos')
  assert.equal(isRoleAllowed(ROLE_REQUIRED_BY_PATH[consulta], 'cliente'), false)
  assert.equal(isRoleAllowed(ROLE_REQUIRED_BY_PATH[consulta], 'advogado'), true)
  assert.equal(normalizeRolePath('/kea-store/certidoes/provider-x'), '/kea-store')
  const certificateAlias = normalizeRolePath('/certidoes/provider-x')
  assert.equal(certificateAlias, '/kea-store')
  assert.equal(isRoleAllowed(ROLE_REQUIRED_BY_PATH[certificateAlias], 'cliente'), false)
  assert.equal(normalizeRolePath('/perfil'), '/perfil')
})

test('matches activities navigation roles to its explicit access policy', () => {
  const allowed = ROLE_REQUIRED_BY_PATH['/atividades']
  assert.equal(isRoleAllowed(allowed, 'cliente'), false)
  assert.equal(isRoleAllowed(allowed, 'escritorio'), true)
})

test('fails closed for plan-controlled menus until the effective policy is available', () => {
  assert.equal(isPlanMenuAllowed('/ia', 'advogado'), false)
  assert.equal(isPlanMenuAllowed('/ia', 'advogado', []), false)
  assert.equal(isPlanMenuAllowed('/ia', 'advogado', '/ia'), false)
  assert.equal(isPlanMenuAllowed('/ia', 'advogado', ['/ia']), true)
  assert.equal(isPlanMenuAllowed('/perfil', 'cliente'), true)
  assert.equal(isPlanMenuAllowed('/processos', 'advogado'), true)
})
