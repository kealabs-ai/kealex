import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/logger.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { logger } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('logs only allowlisted events and numeric allowlisted metrics', () => {
  const original = console.log
  const calls = []
  console.log = (...args) => calls.push(args)
  try {
    logger.info('ai.request', {
      messageCount: 3,
      documentText: 'sigilo profissional',
      accessToken: 'eyJhbGciOiJIUzI1NiJ9.secret.signature',
    })
  } finally {
    console.log = original
  }

  assert.deepEqual(calls, [['[kealex] ai.request', { messageCount: 3 }]])
})

test('drops arbitrary runtime event strings instead of logging them', () => {
  const original = console.error
  const calls = []
  console.error = (...args) => calls.push(args)
  try {
    logger.error('cliente Maria processo 0001234-12.2026.8.26.0001')
  } finally {
    console.error = original
  }

  assert.deepEqual(calls, [])
})

test('allows the fixed activity failure event without accepting request metadata', () => {
  const original = console.error
  const calls = []
  console.error = (...args) => calls.push(args)
  try {
    logger.error('activities.request_failed')
  } finally {
    console.error = original
  }

  assert.deepEqual(calls, [['[kealex] activities.request_failed']])
})
