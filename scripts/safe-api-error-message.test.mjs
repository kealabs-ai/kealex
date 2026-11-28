import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/safeApiErrorMessage.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { safeApiErrorMessage } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('shows a generic fallback and status without exposing server error details', () => {
  const error = {
    message: 'Request failed with status code 422',
    response: { status: 422, data: { detail: 'Descrição confidencial da atividade' } },
  }

  assert.equal(safeApiErrorMessage(error, 'Não foi possível salvar a atividade.'), 'Não foi possível salvar a atividade. (HTTP 422)')
})

test('uses only the fallback for network and malformed errors', () => {
  const fallback = 'Não foi possível carregar suas atividades.'

  assert.equal(safeApiErrorMessage(new Error('URL privada /documentos/123'), fallback), fallback)
  assert.equal(safeApiErrorMessage({ response: { status: '500' } }, fallback), fallback)
  assert.equal(safeApiErrorMessage(null, fallback), fallback)
})
