import { useState } from 'react'
import { DataCard } from './Cards'
import { Button } from './UI'
import { CheckCircle, XCircle, Loader, Play } from 'lucide-react'
import { agentesApi } from '../api/agentes'
import { configuracoesApi } from '../api/configuracoes'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
  data?: any
}

export function AgentesDebugPanel() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const updateResult = (name: string, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name)
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, status, message, data } : r)
      }
      return [...prev, { name, status, message, data }]
    })
  }

  const runTests = async () => {
    setIsRunning(true)
    setResults([])
    setCreatedId(null)

    // === CONFIGURAÇÕES ===
    
    // Teste: CDN
    try {
      updateResult('GET /k1/lex/configuracoes/cdn', 'pending')
      const cdn = await configuracoesApi.getCdn()
      updateResult('GET /k1/lex/configuracoes/cdn', 'success', 'CDN config carregada', cdn)
    } catch (error: any) {
      updateResult('GET /k1/lex/configuracoes/cdn', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: Database
    try {
      updateResult('GET /k1/lex/configuracoes/database', 'pending')
      const db = await configuracoesApi.getDatabase()
      updateResult('GET /k1/lex/configuracoes/database', 'success', 'Database config carregada', db)
    } catch (error: any) {
      updateResult('GET /k1/lex/configuracoes/database', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: Database ENV
    try {
      updateResult('GET /k1/lex/admin/config/env', 'pending')
      const dbEnv = await configuracoesApi.getDatabaseEnv()
      updateResult('GET /k1/lex/admin/config/env', 'success', 'ENV carregadas', dbEnv)
    } catch (error: any) {
      updateResult('GET /k1/lex/admin/config/env', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: IA
    try {
      updateResult('GET /k1/lex/configuracoes/ia', 'pending')
      const ia = await configuracoesApi.getIa()
      updateResult('GET /k1/lex/configuracoes/ia', 'success', 'IA config carregada', ia)
    } catch (error: any) {
      updateResult('GET /k1/lex/configuracoes/ia', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: IA Modelos
    try {
      updateResult('GET /k1/lex/configuracoes/ia/modelos', 'pending')
      const modelos = await configuracoesApi.getModelosDisponiveis()
      updateResult('GET /k1/lex/configuracoes/ia/modelos', 'success', `${Object.keys(modelos).length} providers`, modelos)
    } catch (error: any) {
      updateResult('GET /k1/lex/configuracoes/ia/modelos', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: IA Ativa
    try {
      updateResult('GET /k1/lex/configuracoes/ia/ativa', 'pending')
      const iaAtiva = await configuracoesApi.getIaAtiva()
      updateResult('GET /k1/lex/configuracoes/ia/ativa', 'success', `Provider: ${iaAtiva?.provider}`, iaAtiva)
    } catch (error: any) {
      updateResult('GET /k1/lex/configuracoes/ia/ativa', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: Usuários
    try {
      updateResult('GET /k1/lex/configuracoes/usuarios', 'pending')
      const usuarios = await configuracoesApi.getUsuarios()
      updateResult('GET /k1/lex/configuracoes/usuarios', 'success', 'Usuários config carregada', usuarios)
    } catch (error: any) {
      updateResult('GET /k1/lex/configuracoes/usuarios', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: Segurança
    try {
      updateResult('GET /k1/lex/configuracoes/seguranca', 'pending')
      const seguranca = await configuracoesApi.getSeguranca()
      updateResult('GET /k1/lex/configuracoes/seguranca', 'success', 'Segurança config carregada', seguranca)
    } catch (error: any) {
      updateResult('GET /k1/lex/configuracoes/seguranca', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: Notificações
    try {
      updateResult('GET /k1/lex/configuracoes/notificacoes', 'pending')
      const notif = await configuracoesApi.getNotificacoes()
      updateResult('GET /k1/lex/configuracoes/notificacoes', 'success', 'Notificações config carregada', notif)
    } catch (error: any) {
      updateResult('GET /k1/lex/configuracoes/notificacoes', 'error', error.response?.data?.detail || error.message)
    }

    // === AGENTES ===

    // Teste: Listar agentes
    try {
      updateResult('GET /k1/lex/agentes', 'pending')
      const agentes = await agentesApi.list()
      updateResult('GET /k1/lex/agentes', 'success', `${agentes.length} agentes encontrados`, agentes)
    } catch (error: any) {
      updateResult('GET /k1/lex/agentes', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: Listar agentes públicos
    try {
      updateResult('GET /k1/lex/agentes/publicos', 'pending')
      const publicos = await agentesApi.listPublicos()
      updateResult('GET /k1/lex/agentes/publicos', 'success', `${publicos.length} agentes públicos`, publicos)
    } catch (error: any) {
      updateResult('GET /k1/lex/agentes/publicos', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: Criar agente
    let newId: string | null = null
    try {
      updateResult('POST /k1/lex/agentes', 'pending')
      const novoAgente = {
        nome: 'Teste Debug ' + Date.now(),
        descricao: 'Agente de teste criado pelo debug panel',
        provider: 'groq' as const,
        api_key: 'gsk-test-' + Date.now(),
        modelo: 'llama-3.3-70b-versatile',
        max_tokens: 4096,
        system_prompt: 'Você é um agente de teste',
        ativo: true,
        publico: false
      }
      const created = await agentesApi.create(novoAgente)
      newId = created.id
      setCreatedId(newId)
      updateResult('POST /k1/lex/agentes', 'success', `ID: ${created.id}`, created)
    } catch (error: any) {
      updateResult('POST /k1/lex/agentes', 'error', error.response?.data?.detail || error.message)
    }

    // Teste: Buscar por ID (se criou)
    if (newId) {
      try {
        updateResult('GET /k1/lex/agentes/{id}', 'pending')
        const agente = await agentesApi.get(newId)
        updateResult('GET /k1/lex/agentes/{id}', 'success', `Nome: ${agente.nome}`, agente)
      } catch (error: any) {
        updateResult('GET /k1/lex/agentes/{id}', 'error', error.response?.data?.detail || error.message)
      }

      // Teste: Atualizar
      try {
        updateResult('PUT /k1/lex/agentes/{id}', 'pending')
        const updated = await agentesApi.update(newId, {
          nome: 'Teste Debug Atualizado',
          descricao: 'Descrição atualizada'
        })
        updateResult('PUT /k1/lex/agentes/{id}', 'success', 'Agente atualizado', updated)
      } catch (error: any) {
        updateResult('PUT /k1/lex/agentes/{id}', 'error', error.response?.data?.detail || error.message)
      }

      // Teste: Deletar
      try {
        updateResult('DELETE /k1/lex/agentes/{id}', 'pending')
        await agentesApi.delete(newId)
        updateResult('DELETE /k1/lex/agentes/{id}', 'success', 'Agente deletado')
        setCreatedId(null)
      } catch (error: any) {
        updateResult('DELETE /k1/lex/agentes/{id}', 'error', error.response?.data?.detail || error.message)
      }
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-emerald-500" />
      case 'error':
        return <XCircle size={16} className="text-red-500" />
      case 'pending':
        return <Loader size={16} className="text-blue-500 animate-spin" />
    }
  }

  return (
    <div className="space-y-6">
      <DataCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Debug Panel - Todos os Endpoints</h2>
            <p className="text-xs text-gray-500 mt-1">Validação completa de configurações e agentes IA</p>
          </div>
          <Button
            icon={<Play size={14} />}
            onClick={runTests}
            loading={isRunning}
            disabled={isRunning}
          >
            Executar Testes
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.name}
                className="border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="text-sm font-semibold text-gray-900">{result.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    result.status === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : result.status === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {result.status}
                  </span>
                </div>
                {result.message && (
                  <p className="text-xs text-gray-600 mb-2">{result.message}</p>
                )}
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      Ver resposta
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-lg overflow-auto max-h-40 text-[10px]">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Clique em "Executar Testes" para validar os endpoints</p>
          </div>
        )}
      </DataCard>

      {createdId && (
        <DataCard className="p-4 bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Agente de teste criado
              </p>
              <p className="text-xs text-amber-700 mt-1">
                ID: <code className="bg-amber-100 px-1 py-0.5 rounded">{createdId}</code>
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Este agente será deletado automaticamente ao final dos testes.
              </p>
            </div>
          </div>
        </DataCard>
      )}
    </div>
  )
}
