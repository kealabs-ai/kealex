import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/aiChatErrorMessage.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { aiChatErrorMessage } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('maps AI chat failures to controlled messages without returning provider response bodies', () => {
  const secret = 'prompt confidencial API key sk-secret'

  assert.equal(aiChatErrorMessage({ response: { status: 401, data: { detail: secret } } }, 'OpenAI'), 'Chave da API OpenAI inválida. Verifique as configurações.')
  assert.equal(aiChatErrorMessage({ response: { status: 404, data: { detail: secret } } }, 'OpenAI'), 'A rota de chat não foi encontrada no servidor. Atualize o serviço de configurações de IA.')
  assert.equal(aiChatErrorMessage({ response: { status: 502, data: { detail: secret } } }, 'OpenAI'), 'Erro ao conectar com a IA. Verifique sua configuração.')
  assert.equal(aiChatErrorMessage(new Error(secret), 'OpenAI'), 'Erro ao conectar com a IA. Verifique sua configuração.')
})
