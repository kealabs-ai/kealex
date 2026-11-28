/**
 * Teste manual local dos endpoints de agentes de IA.
 * Requer API local e token de teste fornecido pelo ambiente.
 * O script recusa hosts remotos e nunca imprime credenciais retornadas pela API.
 */
const BASE_URL = process.env.KEALEX_TEST_API_BASE_URL || 'http://127.0.0.1:18000'
const ADMIN_TOKEN = process.env.KEALEX_TEST_ADMIN_TOKEN

function validateTarget() {
  const target = new URL(BASE_URL)
  const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
  if (target.protocol !== 'http:' || !localHosts.has(target.hostname) || target.port !== '18000') {
    throw new Error('Execucao recusada: o teste de agentes so aceita http://localhost:18000 ou loopback equivalente.')
  }
  if (!ADMIN_TOKEN) {
    throw new Error('Execucao recusada: defina KEALEX_TEST_ADMIN_TOKEN com um token local de teste.')
  }
}

function redact(value) {
  if (Array.isArray(value)) return value.map(redact)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key,
    /api[_-]?key|token|secret|authorization/i.test(key) ? '[REDACTED]' : redact(entry),
  ]))
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${ADMIN_TOKEN || ''}`,
}

async function request(path, method = 'GET', body) {
  const response = await fetch(new URL(path, BASE_URL), {
    method,
    headers,
    redirect: 'error',
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => null)
  console.log(`${method} ${path}: HTTP ${response.status}`, redact(data))
  if (!response.ok) throw new Error(`Endpoint respondeu HTTP ${response.status}: ${path}`)
  return data
}

async function runTests() {
  validateTarget()
  console.log('Iniciando testes locais de agentes IA.')
  await request('/v1/lex/agentes')
  await request('/v1/lex/agentes/publicos')

  const agent = await request('/v1/lex/agentes', 'POST', {
    nome: 'Agente Teste Local',
    descricao: 'Agente sintetico para validar endpoints locais',
    provider: 'groq',
    api_key: `gsk-test-${Date.now()}`,
    modelo: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    system_prompt: 'Assistente sintetico de testes locais',
    ativo: true,
    publico: false,
  })
  if (!agent?.id) throw new Error('A criacao local nao retornou o id do agente; update/delete nao executados.')

  const id = encodeURIComponent(agent.id)
  await request(`/v1/lex/agentes/${id}`)
  await request('/v1/lex/agentes/update', 'POST', {
    id: agent.id,
    nome: 'Agente Teste Local Atualizado',
    descricao: 'Atualizacao sintetica local',
  })
  await request('/v1/lex/agentes/delete', 'POST', { id: agent.id })
  console.log('Testes locais de agentes finalizados.')
}

runTests().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Falha nos testes locais de agentes.')
  process.exitCode = 1
})
