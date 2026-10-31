import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, EyeOff, Bot, Globe, Lock, CheckCircle, RefreshCw } from 'lucide-react'
import { DataCard } from './Cards'
import { Button, Input, Textarea, Select } from './UI'
import { Modal } from './Modal'
import { useAgentes, useCreateAgente, useUpdateAgente, useDeleteAgente } from '../hooks/useAgentes'
import { useModelosDisponiveis } from '../hooks/useConfiguracoes'
import type { AgenteIA, AIProvider } from '../types'
import { isModelCompatibleWithProvider } from '../utils/aiModels'

export function AgentesTab() {
  const { data: agentes = [], isLoading } = useAgentes()
  const createAgente = useCreateAgente()
  const updateAgente = useUpdateAgente()
  const deleteAgente = useDeleteAgente()

  const [modal, setModal] = useState<{ type: 'create' | 'edit'; agente?: AgenteIA } | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<string | null>(null)

  const handleSave = async (data: Partial<AgenteIA>) => {
    if (modal?.type === 'edit' && modal.agente) {
      await updateAgente.mutateAsync({ id: modal.agente.id, data })
    } else {
      await createAgente.mutateAsync(data)
    }
    setSaved(modal?.agente?.id || 'new')
    setTimeout(() => setSaved(null), 2000)
    setModal(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agente?')) {
      await deleteAgente.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <DataCard className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </DataCard>
    )
  }

  return (
    <div className="space-y-6">
      <DataCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Agentes de IA</h2>
            <p className="text-xs text-gray-500 mt-1">Configure múltiplos agentes com diferentes modelos e comportamentos</p>
          </div>
          <Button icon={<Plus size={14} />} onClick={() => setModal({ type: 'create' })}>
            Novo Agente
          </Button>
        </div>

        {agentes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Bot size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum agente configurado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agentes.map((agente) => (
              <motion.div
                key={agente.id}
                layout
                className="border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      agente.provider === 'groq' ? 'bg-orange-100' : 'bg-indigo-100'
                    }`}>
                      <Bot size={18} className={agente.provider === 'groq' ? 'text-orange-600' : 'text-indigo-600'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{agente.nome}</h3>
                        {agente.publico ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                            <Globe size={10} /> Público
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            <Lock size={10} /> Privado
                          </span>
                        )}
                        {agente.ativo && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ativo
                          </span>
                        )}
                      </div>
                      {agente.descricao && (
                        <p className="text-xs text-gray-500">{agente.descricao}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className={agente.provider === 'groq' ? 'text-orange-600 font-medium' : 'text-indigo-600 font-medium'}>
                          {{ groq: 'Groq', cerebras: 'Cerebras', openai: 'OpenAI', claude: 'Anthropic', google: 'Google', deepseek: 'DeepSeek' }[agente.provider] || agente.provider}
                        </span>
                        <span>•</span>
                        <span>{agente.modelo}</span>
                        <span>•</span>
                        <span>{agente.max_tokens} tokens</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModal({ type: 'edit', agente })}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(agente.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="text-xs text-gray-400 mb-1">API Key</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-50 px-3 py-2 rounded-lg font-mono">
                      {showKeys[agente.id] ? agente.api_key : '••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, [agente.id]: !prev[agente.id] }))}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showKeys[agente.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </DataCard>

      {modal && (
        <AgenteModal
          agente={modal.agente}
          onSave={handleSave}
          onClose={() => setModal(null)}
          isSaving={createAgente.isPending || updateAgente.isPending}
        />
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg"
        >
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Agente salvo com sucesso!</span>
        </motion.div>
      )}
    </div>
  )
}

function AgenteModal({ 
  agente, 
  onSave, 
  onClose, 
  isSaving 
}: { 
  agente?: AgenteIA
  onSave: (data: Partial<AgenteIA>) => void
  onClose: () => void
  isSaving: boolean
}) {
  const fallbackCerebras = ['llama-3.3-70b', 'llama-3.1-70b', 'llama-3.1-8b']
  const fallbackGroq = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant']
  const fallbacks: Record<AIProvider, string[]> = {
    cerebras: fallbackCerebras,
    groq: fallbackGroq,
    openai: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano'],
    claude: ['claude-sonnet-5', 'claude-opus-5', 'claude-sonnet-4-6'],
    google: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'],
    deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  }

  const { data: modelosDisponiveis } = useModelosDisponiveis()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [modelsByProvider, setModelsByProvider] = useState<Partial<Record<AIProvider, string[]>>>({})
  const [loadingModels, setLoadingModels] = useState(false)
  const [form, setForm] = useState({
    nome: agente?.nome || '',
    descricao: agente?.descricao || '',
    provider: (agente?.provider || 'cerebras') as AIProvider,
    api_key: agente?.api_key || '',
    modelo: agente?.modelo || (agente?.provider ? fallbacks[agente.provider][0] : fallbackCerebras[0]),
    max_tokens: agente?.max_tokens || 8192,
    system_prompt: agente?.system_prompt || '',
    ativo: agente?.ativo ?? true,
    publico: agente?.publico ?? true,
  })

  const loadModels = async (provider: AIProvider, apiKey: string) => {
    const normalizedKey = apiKey.trim()
    if (!normalizedKey) { window.alert('Informe a API Key do provedor selecionado para atualizar os modelos.'); return }
    const validKey = provider === 'cerebras' ? normalizedKey.startsWith('csk-')
      : provider === 'groq' ? normalizedKey.startsWith('gsk-') || normalizedKey.startsWith('gsk_')
      : provider === 'claude' ? normalizedKey.startsWith('sk-ant-')
      : provider === 'google' ? normalizedKey.startsWith('AIza')
      : normalizedKey.startsWith('sk-') && (provider !== 'openai' || !normalizedKey.startsWith('sk-ant-'))
    if (!validKey) { window.alert(`A chave informada não parece ser válida para ${provider}.`); return }

    setLoadingModels(true)
    try {
      let url: string
      let headers: Record<string, string>
      if (provider === 'google') {
        url = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'
        headers = { 'x-goog-api-key': normalizedKey }
      } else if (provider === 'claude') {
        url = 'https://api.anthropic.com/v1/models?limit=100'
        headers = { 'x-api-key': normalizedKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }
      } else {
        const base = provider === 'groq' ? 'https://api.groq.com/openai/v1' : provider === 'cerebras' ? 'https://api.cerebras.ai/v1' : provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1'
        url = `${base}/models`
        headers = { Authorization: `Bearer ${normalizedKey}` }
      }

      const response = await fetch(url, { headers })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.message || `O provedor respondeu com status ${response.status}.`)

      let ids: string[]
      if (provider === 'google') {
        ids = (result.models || []).filter((item: any) => item.supportedGenerationMethods?.includes('generateContent') && /gemini/i.test(item.name || ''))
          .map((item: any) => String(item.baseModelId || item.name.replace(/^models\//, '')))
          .filter((id: string) => !/(embedding|image|audio|tts|live|robotics)/i.test(id))
      } else if (provider === 'claude') {
        ids = (result.data || []).map((item: any) => String(item.id || '')).filter((id: string) => /claude/i.test(id))
      } else {
        ids = (result.data || []).map((item: any) => String(item.id || '')).filter(Boolean)
        if (provider === 'openai') ids = ids.filter((id) => /^(gpt-|o[134]-)/i.test(id))
        if (provider === 'groq') ids = ids.filter((id) => !/(whisper|guard|tts|vision)/i.test(id))
        if (provider === 'deepseek') ids = ids.filter((id) => /^deepseek-/i.test(id))
      }
      ids = Array.from(new Set(ids)).sort()
      if (!ids.length) throw new Error('O provedor não retornou modelos compatíveis com chat.')
      setModelsByProvider((current) => ({ ...current, [provider]: ids }))
      setForm((current) => ({ ...current, modelo: current.provider === provider && ids.includes(current.modelo) ? current.modelo : ids[0] }))
    } catch (error: any) {
      window.alert(error.message || `Não foi possível consultar modelos de ${provider}.`)
    } finally {
      setLoadingModels(false)
    }
  }

  const modelosPorProvider = {
    cerebras: modelosDisponiveis?.cerebras
      ? (modelosDisponiveis.cerebras.includes(form.modelo) ? modelosDisponiveis.cerebras : [form.modelo, ...modelosDisponiveis.cerebras])
      : fallbackCerebras,
    groq: modelosDisponiveis?.groq || fallbackGroq,
    openai: modelosDisponiveis?.openai || fallbacks.openai,
    claude: modelosDisponiveis?.claude || fallbacks.claude,
    google: modelosDisponiveis?.google || fallbacks.google,
    deepseek: modelosDisponiveis?.deepseek || fallbacks.deepseek,
  }

  const handleProviderChange = (newProvider: AIProvider) => {
    const defaultModelo = fallbacks[newProvider][0]
    setForm({ ...form, provider: newProvider, modelo: defaultModelo, api_key: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.api_key) return
    if (!isModelCompatibleWithProvider(form.provider, form.modelo)) {
      window.alert(`O modelo ${form.modelo} não corresponde ao fabricante ${form.provider}.`)
      return
    }
    const key = form.api_key.trim()
    const validKey = form.provider === 'cerebras' ? key.startsWith('csk-')
      : form.provider === 'groq' ? key.startsWith('gsk-') || key.startsWith('gsk_')
      : form.provider === 'claude' ? key.startsWith('sk-ant-')
      : form.provider === 'google' ? key.startsWith('AIza')
      : key.startsWith('sk-') && (form.provider !== 'openai' || !key.startsWith('sk-ant-'))
    if (!validKey) {
      window.alert(`A chave informada não corresponde ao provedor ${form.provider}.`)
      return
    }
    onSave(form)
  }

  const models = modelsByProvider[form.provider]?.length ? modelsByProvider[form.provider]! : modelosPorProvider[form.provider]

  return (
    <Modal onClose={onClose} title={agente ? 'Editar Agente' : 'Novo Agente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Input
            label="Nome do Agente"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex: Assistente Jurídico Trabalhista"
            required
          />
          <Input
            label="Descrição (opcional)"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Breve descrição do agente"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Provider"
            value={form.provider}
            onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
          >
            <option value="cerebras">Cerebras</option>
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
            <option value="claude">Anthropic</option>
            <option value="google">Google</option>
            <option value="deepseek">DeepSeek</option>
          </Select>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Modelo</label>
              <button type="button" onClick={() => loadModels(form.provider, form.api_key)} disabled={!form.api_key.trim() || loadingModels} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
                <RefreshCw size={11} className={loadingModels ? 'animate-spin' : ''} />
                {loadingModels ? 'Buscando...' : 'Atualizar com esta chave'}
              </button>
            </div>
            <select
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="API Key"
          type="password"
          value={form.api_key}
          onChange={(e) => setForm({ ...form, api_key: e.target.value })}
          autoComplete="new-password"
          placeholder={({ groq: 'gsk-...', cerebras: 'csk-...', openai: 'sk-...', claude: 'sk-ant-...', google: 'AIza...', deepseek: 'sk-...' } as Record<AIProvider, string>)[form.provider]}
          required
        />

        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-xs font-medium text-gray-900">Ativo</span>
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="w-4 h-4" />
          </label>
          <label className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-xs font-medium text-gray-900">Público</span>
            <input type="checkbox" checked={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.checked })} className="w-4 h-4" />
          </label>
        </div>

        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>Configurações Avançadas</span>
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 mt-3">
              <Input
                label="Max Tokens"
                type="number"
                value={form.max_tokens}
                onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) })}
              />
              <Textarea
                label="System Prompt (opcional)"
                value={form.system_prompt}
                onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                rows={3}
                placeholder="Deixe vazio para usar o prompt padrão..."
              />
            </motion.div>
          )}
        </div>

        <div className="flex gap-3 pt-3 border-t">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={isSaving} className="flex-1">{agente ? 'Salvar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  )
}
