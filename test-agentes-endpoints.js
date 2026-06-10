/**
 * Script de Teste - Endpoints de Agentes IA
 * 
 * Este script valida se os endpoints de agentes IA estão configurados
 * corretamente e respondendo no backend.
 */

const BASE_URL = 'https://srv1023256.hstgr.cloud'

// Token de autenticação do admin (você precisa fazer login primeiro e copiar o token)
// Para obter o token:
// 1. Acesse http://localhost:5173/login
// 2. Faça login como admin@keahub.com / admin123
// 3. Abra o console do navegador (F12)
// 4. Execute: localStorage.getItem('kealex_token')
// 5. Copie o token e cole abaixo
const ADMIN_TOKEN = 'SEU_TOKEN_AQUI'

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`
}

console.log('🧪 Iniciando testes dos endpoints de Agentes IA...\n')

// Teste 1: Listar todos os agentes
async function testListAgentes() {
  console.log('📋 Teste 1: GET /v1/lex/agentes')
  try {
    const response = await fetch(`${BASE_URL}/v1/lex/agentes`, {
      method: 'GET',
      headers
    })
    const data = await response.json()
    console.log('✅ Status:', response.status)
    console.log('📦 Resposta:', data)
    console.log('📊 Total de agentes:', Array.isArray(data) ? data.length : 'N/A')
    console.log('')
    return data
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('')
    return null
  }
}

// Teste 2: Listar agentes públicos
async function testListAgentesPublicos() {
  console.log('📋 Teste 2: GET /v1/lex/agentes/publicos')
  try {
    const response = await fetch(`${BASE_URL}/v1/lex/agentes/publicos`, {
      method: 'GET',
      headers
    })
    const data = await response.json()
    console.log('✅ Status:', response.status)
    console.log('📦 Resposta:', data)
    console.log('📊 Total de agentes públicos:', Array.isArray(data) ? data.length : 'N/A')
    console.log('')
    return data
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('')
    return null
  }
}

// Teste 3: Criar agente
async function testCreateAgente() {
  console.log('📋 Teste 3: POST /v1/lex/agentes (criar)')
  const novoAgente = {
    nome: 'Agente Teste Validação',
    descricao: 'Agente criado para testar endpoints',
    provider: 'groq',
    api_key: 'gsk-test-key-123',
    modelo: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    system_prompt: 'Você é um assistente de testes',
    ativo: true,
    publico: false
  }
  
  try {
    const response = await fetch(`${BASE_URL}/v1/lex/agentes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(novoAgente)
    })
    const data = await response.json()
    console.log('✅ Status:', response.status)
    console.log('📦 Resposta:', data)
    console.log('🆔 ID do agente criado:', data?.id || 'N/A')
    console.log('')
    return data
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('')
    return null
  }
}

// Teste 4: Buscar agente por ID
async function testGetAgente(id) {
  console.log('📋 Teste 4: POST /v1/lex/agentes/get')
  try {
    const response = await fetch(`${BASE_URL}/v1/lex/agentes/get`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id })
    })
    const data = await response.json()
    console.log('✅ Status:', response.status)
    console.log('📦 Resposta:', data)
    console.log('')
    return data
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('')
    return null
  }
}

// Teste 5: Atualizar agente
async function testUpdateAgente(id) {
  console.log('📋 Teste 5: POST /v1/lex/agentes/update')
  try {
    const response = await fetch(`${BASE_URL}/v1/lex/agentes/update`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id,
        nome: 'Agente Teste Atualizado',
        descricao: 'Descrição atualizada via teste'
      })
    })
    const data = await response.json()
    console.log('✅ Status:', response.status)
    console.log('📦 Resposta:', data)
    console.log('')
    return data
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('')
    return null
  }
}

// Teste 6: Deletar agente
async function testDeleteAgente(id) {
  console.log('📋 Teste 6: POST /v1/lex/agentes/delete')
  try {
    const response = await fetch(`${BASE_URL}/v1/lex/agentes/delete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id })
    })
    const data = await response.json()
    console.log('✅ Status:', response.status)
    console.log('📦 Resposta:', data)
    console.log('')
    return data
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('')
    return null
  }
}

// Executar todos os testes
async function runTests() {
  if (ADMIN_TOKEN === 'SEU_TOKEN_AQUI') {
    console.log('⚠️  ATENÇÃO: Configure o token de admin antes de executar os testes!')
    console.log('\n📝 Para obter o token:')
    console.log('1. Acesse http://localhost:5173/login')
    console.log('2. Faça login como admin@keahub.com / admin123')
    console.log('3. Abra o console do navegador (F12)')
    console.log('4. Execute: localStorage.getItem("kealex_token")')
    console.log('5. Copie o token e cole na variável ADMIN_TOKEN deste script\n')
    return
  }

  console.log('🚀 Iniciando bateria de testes...\n')
  console.log('=' .repeat(60))
  console.log('')

  // Teste 1 e 2: Listar
  await testListAgentes()
  await testListAgentesPublicos()

  // Teste 3: Criar
  const agenteNovo = await testCreateAgente()
  
  if (agenteNovo && agenteNovo.id) {
    const agenteId = agenteNovo.id

    // Teste 4: Buscar por ID
    await testGetAgente(agenteId)

    // Teste 5: Atualizar
    await testUpdateAgente(agenteId)

    // Teste 6: Deletar
    await testDeleteAgente(agenteId)
  } else {
    console.log('⚠️  Não foi possível criar agente. Pulando testes de update/delete.')
  }

  console.log('=' .repeat(60))
  console.log('\n✨ Testes finalizados!')
}

// Se executado no Node.js
if (typeof window === 'undefined') {
  runTests()
}

// Se executado no navegador
if (typeof window !== 'undefined') {
  console.log('🌐 Script carregado no navegador. Execute runTests() para iniciar.')
  window.runTests = runTests
  window.testListAgentes = testListAgentes
  window.testListAgentesPublicos = testListAgentesPublicos
  window.testCreateAgente = testCreateAgente
}
