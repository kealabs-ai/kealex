import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Save, CheckCircle, ExternalLink, Eye, EyeOff, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button, Input, Textarea } from '../components/UI'
import { DataCard } from '../components/Cards'
import { configuracoesApi, type IaProvider } from '../api/configuracoes'
import { useToast } from '../components/Toast'

const PROVIDERS: { id: IaProvider; label: string; url: string; docs: string; keyPrefix: string; models: string[] }[] = [
  { id: 'cerebras', label: 'Cerebras', url: 'https://cloud.cerebras.ai', docs: 'https://inference-docs.cerebras.ai/quickstart', keyPrefix: 'csk-', models: ['llama-3.3-70b', 'llama-3.1-70b', 'llama-3.1-8b'] },
  { id: 'groq', label: 'Groq', url: 'https://console.groq.com', docs: 'https://console.groq.com/docs/quickstart', keyPrefix: 'gsk-', models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'] },
  { id: 'openai', label: 'OpenAI (GPT)', url: 'https://platform.openai.com/api-keys', docs: 'https://platform.openai.com/docs/models', keyPrefix: 'sk-', models: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano'] },
  { id: 'google', label: 'Google (Gemini)', url: 'https://aistudio.google.com/app/apikey', docs: 'https://ai.google.dev/gemini-api/docs/models', keyPrefix: 'AIza', models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'] },
  { id: 'claude', label: 'Claude', url: 'https://console.anthropic.com/settings/keys', docs: 'https://docs.anthropic.com/en/docs/about-claude/models', keyPrefix: 'sk-ant-', models: ['claude-opus-5', 'claude-sonnet-5', 'claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'] },
  { id: 'deepseek', label: 'DeepSeek', url: 'https://platform.deepseek.com/api_keys', docs: 'https://api-docs.deepseek.com/', keyPrefix: 'sk-', models: ['deepseek-chat', 'deepseek-reasoner'] },
]

type Fields = { api_key: string; endpoint_url: string; modelo: string; max_tokens: string; system_prompt: string; ativo: boolean }
const defaults: Record<IaProvider, Fields> = {
  cerebras: { api_key: '', endpoint_url: '', modelo: 'llama-3.3-70b', max_tokens: '8192', system_prompt: '', ativo: true },
  groq: { api_key: '', endpoint_url: '', modelo: 'llama-3.3-70b-versatile', max_tokens: '8192', system_prompt: '', ativo: true },
  openai: { api_key: '', endpoint_url: 'https://api.openai.com/v1', modelo: 'gpt-5.5', max_tokens: '8192', system_prompt: '', ativo: true },
  google: { api_key: '', endpoint_url: '', modelo: 'gemini-3.8-flash', max_tokens: '8192', system_prompt: '', ativo: true },
  claude: { api_key: '', endpoint_url: '', modelo: 'claude-sonnet-5', max_tokens: '8192', system_prompt: '', ativo: true },
  deepseek: { api_key: '', endpoint_url: '', modelo: 'deepseek-chat', max_tokens: '8192', system_prompt: '', ativo: true },
}

export function IATab() {
  const queryClient = useQueryClient()
  const { success, error: toastError, warning } = useToast()
  const { data, isLoading, isError } = useQuery({ queryKey: ['configuracoes', 'ia', 'provedores'], queryFn: configuracoesApi.getIaProviders })
  const { data: availableModels } = useQuery({ queryKey: ['configuracoes', 'ia', 'modelos'], queryFn: configuracoesApi.getModelosDisponiveis })
  const [provider, setProvider] = useState<IaProvider>('cerebras')
  const [fieldsByProvider, setFieldsByProvider] = useState<Record<IaProvider, Fields>>(defaults)
  const [showKey, setShowKey] = useState(false)
  const [dynamicModels, setDynamicModels] = useState<Partial<Record<IaProvider, string[]>>>({})
  const [loadingModels, setLoadingModels] = useState(false)
  const [saved, setSaved] = useState(false)
  const initializedProvider = useRef(false)
  const current = PROVIDERS.find((item) => item.id === provider)!

  useEffect(() => {
    if (!data) return
    if (!initializedProvider.current) {
      setProvider(data.active_provider)
      initializedProvider.current = true
    }
    setFieldsByProvider((prev) => {
      const next = { ...prev }
      for (const item of PROVIDERS) {
        const savedConfig = data.providers[item.id]
        if (savedConfig) next[item.id] = {
          // O backend omite o segredo da resposta. Preserve o valor digitado
          // em memória para este provedor durante refetches e salvamentos.
          api_key: prev[item.id].api_key || savedConfig.api_key || '', endpoint_url: savedConfig.endpoint_url || defaults[item.id].endpoint_url, modelo: savedConfig.modelo || defaults[item.id].modelo,
          max_tokens: String(savedConfig.max_tokens || 8192), system_prompt: savedConfig.system_prompt || '', ativo: savedConfig.ativo ?? true,
        }
      }
      return next
    })
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const values = fieldsByProvider[provider]
      const key = values.api_key.trim()
      const validKey = !key || (provider === 'cerebras' ? key.startsWith('csk-') : provider === 'groq' ? key.startsWith('gsk-') || key.startsWith('gsk_') : provider === 'openai' || provider === 'deepseek' ? key.startsWith('sk-') : provider === 'google' ? key.startsWith('AIza') : key.startsWith('sk-ant-'))
      if (!validKey) throw new Error(`A chave informada não corresponde ao formato esperado para ${current.label}.`)
      return configuracoesApi.saveIaProvider(provider, { ...values, api_key: key, max_tokens: Number.parseInt(values.max_tokens, 10) || 8192 })
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['configuracoes', 'ia'] }); setSaved(true); success('Configuração salva com sucesso!'); setTimeout(() => setSaved(false), 3000) },
    onError: (error: any) => toastError(error.response?.data?.detail || error.message || 'Erro ao salvar configuração'),
  })
  const activateMutation = useMutation({
    mutationFn: () => configuracoesApi.activateIaProvider(provider),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['configuracoes', 'ia'] }); success(`${current.label} ativado como provedor de IA.`) },
    onError: (error: any) => toastError(error.response?.data?.detail || 'Salve uma chave API válida antes de ativar este provedor.'),
  })

  const models = useMemo(() => dynamicModels[provider]?.length ? dynamicModels[provider]! : availableModels?.[provider]?.length ? availableModels[provider] : current.models, [availableModels, dynamicModels, provider, current])
  const fields = fieldsByProvider[provider]
  const setField = (key: keyof Fields, value: string | boolean) => setFieldsByProvider((prev) => ({ ...prev, [provider]: { ...prev[provider], [key]: value } }))

  const refreshModels = async () => {
    if (provider === 'deepseek') {
      setDynamicModels((prev) => ({ ...prev, deepseek: availableModels?.deepseek?.length ? availableModels.deepseek : current.models }))
      success('Lista de modelos DeepSeek atualizada usando os modelos de referência.')
      return
    }
    if (!fields.api_key.trim()) { warning('Informe a chave API para consultar os modelos disponíveis.'); return }
    setLoadingModels(true)
    try {
      let response: Response
      let result: any
      if (provider === 'google') {
        response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', { headers: { 'x-goog-api-key': fields.api_key } })
        result = await response.json()
        if (!response.ok) throw new Error(result.error?.message || 'Não foi possível consultar modelos Gemini.')
        const ids: string[] = (result.models || []).filter((m: any) => m.supportedGenerationMethods?.includes('generateContent') && /gemini/i.test(m.name || '')).map((m: any) => String(m.baseModelId || m.name.replace(/^models\//, ''))).filter((id: string) => !/(embedding|image|audio|tts|live|robotics)/i.test(id))
        const models: string[] = Array.from(new Set<string>(ids)).sort()
        setDynamicModels((prev) => ({ ...prev, google: models }))
        if (models.length && !models.includes(fields.modelo)) setField('modelo', models[0])
      } else if (provider === 'claude') {
        response = await fetch('https://api.anthropic.com/v1/models?limit=100', { headers: { 'x-api-key': fields.api_key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } })
        result = await response.json()
        if (!response.ok) throw new Error(result.error?.message || 'Não foi possível consultar modelos Claude.')
        const models = (result.data || []).map((m: any) => m.id as string).filter((id: string) => /claude/i.test(id)).sort()
        setDynamicModels((prev) => ({ ...prev, claude: models }))
        if (models.length && !models.includes(fields.modelo)) setField('modelo', models[0])
      } else {
        const base = provider === 'groq' ? 'https://api.groq.com/openai/v1' : provider === 'cerebras' ? 'https://api.cerebras.ai/v1' : 'https://api.openai.com/v1'
        response = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${fields.api_key}` } })
        result = await response.json()
        if (!response.ok) throw new Error(result.error?.message || 'Não foi possível consultar modelos do provedor.')
        let ids = (result.data || []).map((m: any) => m.id as string).filter(Boolean)
        if (provider === 'openai') ids = ids.filter((id: string) => /^(gpt-|o[134]-)/i.test(id))
        if (provider === 'groq') ids = ids.filter((id: string) => !/(whisper|guard|tts|vision)/i.test(id))
        ids.sort()
        setDynamicModels((prev) => ({ ...prev, [provider]: ids }))
        if (ids.length && !ids.includes(fields.modelo)) setField('modelo', ids[0])
      }
      success('Lista de modelos atualizada.')
    } catch (error: any) {
      toastError(error.message || 'Não foi possível carregar os modelos. Confira a chave e tente novamente.')
    } finally { setLoadingModels(false) }
  }

  if (isLoading) return <DataCard className="p-6"><div className="flex justify-center py-12 text-sm text-gray-500">Carregando configurações de IA...</div></DataCard>

  return (
    <DataCard className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-base font-semibold text-gray-900">Provedores de IA</h2><p className="text-sm text-gray-500 mt-1">Configure e salve as credenciais de cada provedor. Ative aquele que será usado pela plataforma.</p></div>
        <a href={current.docs} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">Documentação <ExternalLink size={12} /></a>
      </div>
      {isError && <div className="p-3 rounded-lg bg-amber-50 text-sm text-amber-800">Não foi possível carregar as configurações salvas. Atualize a página e tente novamente.</div>}

      <div>
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Provedor</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PROVIDERS.map((item) => {
            const selected = provider === item.id
            const active = data?.active_provider === item.id
            return <button key={item.id} type="button" onClick={() => { setProvider(item.id); setShowKey(false); setSaved(false) }} className={`p-3 border-2 rounded-xl text-left transition-colors ${selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="flex items-center justify-between gap-2"><span className="font-semibold text-sm text-gray-900">{item.label}</span>{active && <span className="text-[10px] font-semibold uppercase text-emerald-700">Ativo</span>}</span>
              <span className="block mt-1 text-xs text-gray-500">{data?.providers[item.id]?.configured ? 'Chave salva' : 'Adicione sua chave API'}</span>
            </button>
          })}
        </div>
      </div>

      <div className="p-4 border-2 border-gray-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-900">{current.label} — Credenciais</h3><a href={current.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-700 hover:underline">Obter chave API ↗</a></div>
        <div className="relative"><Input label="API Key" type={showKey ? 'text' : 'password'} placeholder={data?.providers[provider]?.configured ? 'Chave salva; deixe em branco para manter ou informe uma nova' : `${current.keyPrefix}...`} value={fields.api_key} onChange={(e) => setField('api_key', e.target.value)} />
          <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-[30px] text-gray-400 hover:text-gray-600" title={showKey ? 'Ocultar chave' : 'Mostrar chave'}>{showKey ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3"><div><p className="text-sm font-medium text-gray-900">Configuração habilitada</p><p className="text-xs text-gray-500">Permite usar este provedor após ativá-lo.</p></div><button type="button" role="switch" aria-checked={fields.ativo} onClick={() => setField('ativo', !fields.ativo)} className={`relative inline-flex h-6 w-11 items-center rounded-full ${fields.ativo ? 'bg-emerald-500' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${fields.ativo ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
      </div>

      {provider === 'openai' && <div><Input label="Endpoint da API OpenAI" type="url" value={fields.endpoint_url} onChange={(e) => setField('endpoint_url', e.target.value)} placeholder="https://api.openai.com/v1" /><p className="text-xs text-gray-500 mt-1">Endpoint oficial usado pelo chat: https://api.openai.com/v1/responses.</p></div>}

      <div>
        <div className="flex items-center justify-between mb-1.5"><label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Modelo</label><button type="button" onClick={refreshModels} disabled={loadingModels} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50"><RefreshCw size={12} className={loadingModels ? 'animate-spin' : ''} />{loadingModels ? 'Consultando...' : 'Atualizar modelos'}</button></div>
        <select value={fields.modelo} onChange={(e) => setField('modelo', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
          {models.map((model) => <option key={model} value={model}>{model}</option>)}
        </select>
        {!models.includes(fields.modelo) && <p className="mt-2 flex items-center gap-1 text-xs text-amber-700"><AlertTriangle size={13} /> Modelo não está na lista atual. Escolha uma opção disponível.</p>}
        <p className="text-xs text-gray-400 mt-1">Lista de modelos compatíveis com a API do provedor.</p>
      </div>
      <Input label="Max Tokens" type="number" value={fields.max_tokens} onChange={(e) => setField('max_tokens', e.target.value)} />
      <div><Textarea label="System Prompt (Personalizado)" rows={5} value={fields.system_prompt} onChange={(e) => setField('system_prompt', e.target.value)} placeholder="Deixe vazio para usar o prompt padrão otimizado para direito brasileiro..." /><p className="text-xs text-gray-500 mt-1">O prompt padrão já é otimizado para atuação jurídica.</p></div>

      <div className="border-t border-gray-100 pt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-gray-500">{data?.active_provider === provider ? `${current.label} é o provedor ativo.` : `${current.label} está configurado, mas ainda não está ativo.`}</span>
        <div className="flex items-center gap-2">{saved && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1 text-sm text-emerald-600"><CheckCircle size={14} /> Salvo</motion.span>}
          {data?.active_provider !== provider && <Button variant="secondary" onClick={() => activateMutation.mutate()} loading={activateMutation.isPending}>Ativar provedor</Button>}
          <Button icon={<Save size={15} />} onClick={() => { if (!fields.api_key.trim() && !data?.providers[provider]?.configured) { warning('Informe a chave API antes de salvar.'); return } if (!models.includes(fields.modelo)) { warning('Selecione um modelo disponível para este provedor.'); return } saveMutation.mutate() }} loading={saveMutation.isPending}>Salvar configuração</Button>
        </div>
      </div>
    </DataCard>
  )
}
