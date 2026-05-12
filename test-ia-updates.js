// Script de teste para validar as atualizações de IA
// Execute no console do navegador na página de configurações

console.log('🧪 Testando atualizações de IA...')

// Teste 1: Verificar se os novos modelos Groq estão disponíveis
const modelosGroqEsperados = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile', 
  'llama-3.1-8b-instant',
  'llama-3.2-90b-text-preview',
  'llama-3.2-11b-text-preview',
  'llama-3.2-3b-preview',
  'llama-3.2-1b-preview',
  'gemma2-9b-it',
  'gemma-7b-it'
]

// Teste 2: Verificar se modelos descontinuados foram removidos
const modelosDescontinuados = [
  'mixtral-8x7b-32768'
]

// Teste 3: Verificar endpoint de modelos disponíveis
fetch('/configuracoes/ia/modelos', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Endpoint /configuracoes/ia/modelos funcionando')
  console.log('📋 Modelos disponíveis:', data)
  
  // Verificar se todos os modelos Groq esperados estão presentes
  const modelosGroqRecebidos = data.groq || []
  const modelosFaltando = modelosGroqEsperados.filter(m => !modelosGroqRecebidos.includes(m))
  const modelosDescontinuadosPresentes = modelosDescontinuados.filter(m => modelosGroqRecebidos.includes(m))
  
  if (modelosFaltando.length === 0) {
    console.log('✅ Todos os modelos Groq esperados estão presentes')
  } else {
    console.log('❌ Modelos Groq faltando:', modelosFaltando)
  }
  
  if (modelosDescontinuadosPresentes.length === 0) {
    console.log('✅ Nenhum modelo descontinuado encontrado')
  } else {
    console.log('⚠️ Modelos descontinuados ainda presentes:', modelosDescontinuadosPresentes)
  }
  
  console.log('🎉 Teste concluído!')
})
.catch(err => {
  console.log('❌ Erro ao testar endpoint:', err)
})

// Instruções para teste manual
console.log(`
📝 TESTE MANUAL:
1. Acesse Configurações > Agentes IA
2. Selecione provider "Groq"
3. Verifique se a lista de modelos contém os novos modelos
4. Configure um modelo descontinuado no backend e veja se aparece o aviso
5. Teste a funcionalidade de chat com um dos novos modelos

🔧 MODELOS ESPERADOS:
Groq: ${modelosGroqEsperados.join(', ')}

❌ MODELOS REMOVIDOS:
${modelosDescontinuados.join(', ')}
`)