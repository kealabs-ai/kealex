import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/documentUploadValidation.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { canReplayUploadAfterListFailure, documentUploadFailureMessage, documentUploadRecoveryId, validateDocumentUpload } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('accepts allowed extensions and the exact configured size limit', () => {
  assert.equal(validateDocumentUpload('Peticao.PDF', 1024, 1024), null)
  assert.equal(validateDocumentUpload('contrato.doc', 10, 1024), null)
  assert.equal(validateDocumentUpload('contrato.docx', 10, 1024), null)
})

test('rejects unsupported types, empty files, and files over the limit', () => {
  assert.equal(validateDocumentUpload('arquivo.exe', 10, 1024), 'unsupported-type')
  assert.equal(validateDocumentUpload('arquivo.pdf', 0, 1024), 'empty-file')
  assert.equal(validateDocumentUpload('arquivo.pdf', 1025, 1024), 'too-large')
})

test('fails closed when the upload limit is invalid', () => {
  assert.equal(validateDocumentUpload('arquivo.pdf', 10, 0), 'invalid-limit')
  assert.equal(validateDocumentUpload('arquivo.pdf', 10, Number.NaN), 'invalid-limit')
})

test('shows safe actionable messages for server-side upload failures', () => {
  assert.match(documentUploadFailureMessage(503), /verificacao de seguranca.*Tente novamente mais tarde/i)
  assert.match(documentUploadFailureMessage(413), /limite permitido/i)
  assert.match(documentUploadFailureMessage(415), /formato permitido/i)
  assert.match(documentUploadFailureMessage(500), /Nao foi possivel enviar/i)
})

test('replays after file-list failure only with the same idempotency key and never bypasses auth denials', () => {
  assert.equal(canReplayUploadAfterListFailure(503, true), true)
  assert.equal(canReplayUploadAfterListFailure(429, true), true)
  assert.equal(canReplayUploadAfterListFailure(undefined, true, true), true)
  assert.equal(canReplayUploadAfterListFailure(undefined, true), false)
  assert.equal(canReplayUploadAfterListFailure(503, false), false)
  assert.equal(canReplayUploadAfterListFailure(401, true), false)
  assert.equal(canReplayUploadAfterListFailure(403, true), false)
  assert.equal(canReplayUploadAfterListFailure(404, true), false)
})

test('extracts only valid opaque IDs from upload cleanup failures', () => {
  const recoveryId = '78c79a42-c1e0-48e3-a3e7-52d9020d067d'
  assert.equal(documentUploadRecoveryId({ detail: { code: 'upload_cleanup_pending', recoveryId } }), recoveryId)
  assert.equal(documentUploadRecoveryId({ detail: { code: 'other_error', recoveryId } }), null)
  assert.equal(documentUploadRecoveryId({ detail: { code: 'upload_cleanup_pending', recoveryId: '../secret' } }), null)
  assert.equal(documentUploadRecoveryId('server error'), null)
})
