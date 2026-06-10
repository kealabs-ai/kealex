import { useState } from 'react'
import { DataCard } from './Cards'
import { Button } from './UI'
import { CheckCircle, XCircle, Loader, Play } from 'lucide-react'
import { agentesApi } from '../api/agentes'

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

    // Teste 1: Listar agentes
    try {
      updateResult('List Agentes', 'pending')
      const agentes = await agentesApi.list()
      updateResult('List Agentes', 'success', `${agentes.length} agentes encontrados`, agentes)
    } catch (error: any) {
      updateResult('List Agentes', 'error', error.response?.data?.detail || error.message)
    }

    // Teste 2: Listar agentes públicos
    try {
      updateResult('List Públicos', 'pending')
      const publicos = await agentesApi.listPublicos()
      updateResult('List Públicos', 'success', `${publicos.length} agentes públicos`, publicos)
    } catch (error: any) {
      updateResult('List Públicos', 'error', error.response?.data?.detail || error.message)
    }

    // Teste 3: Criar agente
    let newId: string | null = null
    try {
      updateResult('Create Agente', 'pending')
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
      updateResult('Create Agente', 'success', `ID: ${created.id}`, created)
    } catch (error: any) {
      updateResult('Create Agente', 'error', error.response?.data?.detail || error.message)
    }

    // Teste 4: Buscar por ID (se criou)
    if (newId) {
      try {
        updateResult('Get Agente', 'pending')
        const agente = await agentesApi.get(newId)
        updateResult('Get Agente', 'success', `Nome: ${agente.nome}`, agente)
      } catch (error: any) {
        updateResult('Get Agente', 'error', error.response?.data?.detail || error.message)
      }

      // Teste 5: Atualizar
      try {
        updateResult('Update Agente', 'pending')
        const updated = await agentesApi.update(newId, {
          nome: 'Teste Debug Atualizado',
          descricao: 'Descrição atualizada'
        })
        updateResult('Update Agente', 'success', 'Agente atualizado', updated)
      } catch (error: any) {
        updateResult('Update Agente', 'error', error.response?.data?.detail || error.message)
      }

      // Teste 6: Deletar
      try {
        updateResult('Delete Agente', 'pending')
        await agentesApi.delete(newId)
        updateResult('Delete Agente', 'success', 'Agente deletado')
        setCreatedId(null)
      } catch (error: any) {
        updateResult('Delete Agente', 'error', error.response?.data?.detail || error.message)
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
            <h2 className="text-base font-semibold text-gray-900">Debug Panel - Endpoints</h2>
            <p className="text-xs text-gray-500 mt-1">Validação dos endpoints de agentes IA</p>
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
