import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bot, CheckCircle, KeyRound, Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import { configuracoesApi, type IaProvider, type UserIaApiKey } from '../api/configuracoes'
import { Button, Input, Select } from '../components/UI'
import { DataCard } from '../components/Cards'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

const PROVIDERS: { id: IaProvider; label: string; prefix: string; models: string[] }[] = [
  { id: 'openai', label: 'OpenAI', prefix: 'sk-', models: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano'] },
  { id: 'claude', label: 'Anthropic', prefix: 'sk-ant-', models: ['claude-sonnet-5', 'claude-opus-5', 'claude-sonnet-4-6'] },
  { id: 'google', label: 'Google', prefix: 'AIza', models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'] },
  { id: 'groq', label: 'Groq', prefix: 'gsk-', models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'] },
  { id: 'cerebras', label: 'Cerebras', prefix: 'csk-', models: ['llama-3.3-70b', 'llama-3.1-70b', 'llama-3.1-8b'] },
  { id: 'deepseek', label: 'DeepSeek', prefix: 'sk-', models: ['deepseek-chat', 'deepseek-reasoner'] },
]

const providerLabel = (id: IaProvider) => PROVIDERS.find((provider) => provider.id === id)?.label ?? id

export function MinhaIAPage() {
  const queryClient = useQueryClient()
  const { success, error: toastError } = useToast()
  const { data: keys = [], isLoading, isError } = useQuery({ queryKey: ['minhas-chaves-ia'], queryFn: configuracoesApi.getMyIaKeys })
  const { data: availableModels } = useQuery({ queryKey: ['configuracoes', 'ia', 'modelos'], queryFn: configuracoesApi.getModelosDisponiveis })
  const [editing, setEditing] = useState<UserIaApiKey | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ provider: 'openai' as IaProvider, model: 'gpt-5.5', api_key: '', is_active: true })
  const [modelsByProvider, setModelsByProvider] = useState<Partial<Record<IaProvider, string[]>>>({})
  const [loadingModels, setLoadingModels] = useState(false)

  const models = useMemo(() => {
    const configured = availableModels?.[form.provider]
    const fallback = PROVIDERS.find((item) => item.id === form.provider)?.models ?? []
    const list = modelsByProvider[form.provider]?.length ? modelsByProvider[form.provider]! : configured?.length ? configured : fallback
    return form.model && !list.includes(form.model) ? [form.model, ...list] : list
  }, [availableModels, form.model, form.provider, modelsByProvider])

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ provider: 'openai', model: 'gpt-5.5', api_key: '', is_active: true }) }
  const openCreate = () => { setEditing(null); setForm({ provider: 'openai', model: 'gpt-5.5', api_key: '', is_active: true }); setModalOpen(true) }
  const openEdit = (item: UserIaApiKey) => { setEditing(item); setForm({ provider: item.provider, model: item.model, api_key: '', is_active: item.is_active }); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: () => {
      const apiKey = form.api_key.trim()
      if (editing) return configuracoesApi.updateMyIaKey(editing.id, { provider: form.provider, model: form.model, is_active: form.is_active, ...(apiKey ? { api_key: apiKey } : {}) })
      if (!apiKey) throw new Error('Informe a chave API para cadastrar esta configuração.')
      return configuracoesApi.createMyIaKey({ provider: form.provider, model: form.model, api_key: apiKey, is_active: form.is_active })
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['minhas-chaves-ia'] }); closeModal(); success('Configuração pessoal de IA salva.') },
    onError: (err: any) => toastError(err.response?.data?.detail || err.message || 'Não foi possível salvar a configuração.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => configuracoesApi.updateMyIaKey(id, { is_active }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['minhas-chaves-ia'] }); success('Status da chave atualizado.') },
    onError: (err: any) => toastError(err.response?.data?.detail || 'Não foi possível atualizar o status.'),
  })

  const deleteMutation = useMutation({
    mutationFn: configuracoesApi.deleteMyIaKey,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['minhas-chaves-ia'] }); success('Chave removida.') },
    onError: (err: any) => toastError(err.response?.data?.detail || 'Não foi possível excluir a chave.'),
  })

  const selectedProvider = PROVIDERS.find((item) => item.id === form.provider)!

  const refreshModels = async () => {
    const apiKey = form.api_key.trim()
    if (!apiKey) { toastError('Informe a chave API para consultar os modelos deste provedor.'); return }
    setLoadingModels(true)
    try {
      let url: string
      let headers: Record<string, string>
      if (form.provider === 'google') {
        url = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'
        headers = { 'x-goog-api-key': apiKey }
      } else if (form.provider === 'claude') {
        url = 'https://api.anthropic.com/v1/models?limit=100'
        headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }
      } else {
        const base = form.provider === 'groq' ? 'https://api.groq.com/openai/v1' : form.provider === 'cerebras' ? 'https://api.cerebras.ai/v1' : form.provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1'
        url = `${base}/models`
        headers = { Authorization: `Bearer ${apiKey}` }
      }

      const response = await fetch(url, { headers })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.message || `O provedor respondeu com status ${response.status}.`)

      let ids: string[]
      if (form.provider === 'google') {
        ids = (result.models || [])
          .filter((item: any) => item.supportedGenerationMethods?.includes('generateContent') && /gemini/i.test(item.name || ''))
          .map((item: any) => String(item.baseModelId || item.name.replace(/^models\//, '')))
          .filter((id: string) => !/(embedding|image|audio|tts|live|robotics)/i.test(id))
      } else if (form.provider === 'claude') {
        ids = (result.data || []).map((item: any) => String(item.id || '')).filter((id: string) => /claude/i.test(id))
      } else {
        ids = (result.data || []).map((item: any) => String(item.id || '')).filter(Boolean)
        if (form.provider === 'openai') ids = ids.filter((id) => /^(gpt-|o[134]-)/i.test(id))
        if (form.provider === 'groq') ids = ids.filter((id) => !/(whisper|guard|tts|vision)/i.test(id))
        if (form.provider === 'deepseek') ids = ids.filter((id) => /^deepseek-/i.test(id))
      }
      ids = Array.from(new Set(ids)).sort()
      if (!ids.length) throw new Error('A chave foi aceita, mas o provedor não retornou modelos compatíveis.')
      setModelsByProvider((current) => ({ ...current, [form.provider]: ids }))
      setForm((current) => ({ ...current, model: ids.includes(current.model) ? current.model : ids[0] }))
      success(`${ids.length} modelos carregados de ${selectedProvider.label}.`)
    } catch (err: any) {
      toastError(err.message || `Não foi possível consultar modelos de ${selectedProvider.label}.`)
    } finally {
      setLoadingModels(false)
    }
  }

  return <div className="space-y-6">
    <DataCard className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-base font-semibold text-gray-900">Minhas chaves de IA</h2><p className="mt-1 max-w-2xl text-sm text-gray-500">Cadastre credenciais pessoais. Elas são criptografadas no servidor e usadas no seu chat sem substituir as configurações globais do escritório.</p></div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>Adicionar chave</Button>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-600" /><span>A chave completa nunca é devolvida ao navegador. Você verá apenas uma versão mascarada e poderá substituí-la ao editar.</span></div>

      {isLoading ? <p className="py-10 text-center text-sm text-gray-500">Carregando suas credenciais...</p> : isError ? <p className="py-8 text-center text-sm text-rose-600">Não foi possível carregar suas chaves de IA.</p> : keys.length === 0 ? <div className="py-12 text-center text-gray-500"><KeyRound size={34} className="mx-auto mb-3 text-slate-300" /><p className="text-sm">Você ainda não cadastrou uma chave pessoal.</p><p className="mt-1 text-xs">Sem uma chave ativa, o chat continua usando a configuração padrão disponível.</p></div> : <div className="mt-5 grid gap-3 md:grid-cols-2">
        {keys.map((item) => <div key={item.id} className="rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Bot size={18} /></span><div><h3 className="text-sm font-semibold text-gray-900">{providerLabel(item.provider)}</h3><p className="mt-0.5 text-xs text-gray-500">{item.model}</p></div></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.is_active ? 'ATIVA' : 'INATIVA'}</span></div>
          <div className="mt-4 flex items-center justify-between gap-2"><code className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{item.api_key_masked}</code><div className="flex gap-1"><button type="button" title="Editar" aria-label={`Editar chave ${providerLabel(item.provider)}`} onClick={() => openEdit(item)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Pencil size={15} /></button><button type="button" title={item.is_active ? 'Desativar' : 'Ativar'} aria-label={item.is_active ? 'Desativar chave' : 'Ativar chave'} onClick={() => updateMutation.mutate({ id: item.id, is_active: !item.is_active })} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600">{item.is_active ? <CheckCircle size={15} /> : <KeyRound size={15} />}</button><button type="button" title="Excluir" aria-label={`Excluir chave ${providerLabel(item.provider)}`} onClick={() => { if (window.confirm(`Excluir a chave de ${providerLabel(item.provider)} (${item.model})?`)) deleteMutation.mutate(item.id) }} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></div></div>
        </div>)}
      </div>}
    </DataCard>

    {modalOpen && <Modal title={editing ? 'Editar chave de IA' : 'Nova chave de IA'} onClose={closeModal}>
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate() }}>
        <Select label="Provedor" value={form.provider} onChange={(event) => { const provider = event.target.value as IaProvider; const firstModel = availableModels?.[provider]?.[0] || PROVIDERS.find((item) => item.id === provider)?.models[0] || ''; setForm((current) => ({ ...current, provider, model: firstModel })) }}>
          {PROVIDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </Select>
        <div>
          <div className="mb-1 flex items-center justify-between gap-3"><label className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">Modelo</label><button type="button" onClick={refreshModels} disabled={!form.api_key.trim() || loadingModels} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400"><RefreshCw size={13} className={loadingModels ? 'animate-spin' : ''} />{loadingModels ? 'Buscando modelos...' : 'Atualizar lista com esta chave'}</button></div>
          <Select aria-label="Modelo" value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}>
            {models.map((model) => <option key={model} value={model}>{model}</option>)}
          </Select>
          <p className="mt-1 text-xs text-gray-500">A consulta usa a chave informada acima diretamente no provedor selecionado.</p>
        </div>
        <div><Input label="API Key" type="password" autoComplete="new-password" value={form.api_key} onChange={(event) => setForm((current) => ({ ...current, api_key: event.target.value }))} placeholder={editing ? 'Chave protegida; informe uma nova para substituir' : `${selectedProvider.prefix}...`} required={!editing} /><p className="mt-1 text-xs text-gray-500">A credencial será associada somente à sua conta e ao provedor selecionado.</p></div>
        <label className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>Usar esta configuração no chat</span><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4" /></label>
        <div className="flex justify-end gap-2 border-t pt-3"><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button><Button type="submit" loading={saveMutation.isPending}>Salvar chave</Button></div>
      </form>
    </Modal>}
  </div>
}
