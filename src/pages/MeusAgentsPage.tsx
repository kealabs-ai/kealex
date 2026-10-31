import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bot, Plus, Pencil, Trash2, Sparkles } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { PageBanner } from '../components/PageBanner'
import { Button, Input, Select, Textarea } from '../components/UI'
import { Modal } from '../components/Modal'
import { DataCard } from '../components/Cards'
import { useAIPolicy } from '../hooks/useAIPolicy'
import { configuracoesApi } from '../api/configuracoes'
import { useCreateMeuAgente, useDeleteMeuAgente, useMeusAgentes, useUpdateMeuAgente } from '../hooks/useAgentes'
import type { AgenteIA, AIProvider } from '../types'
import { isModelCompatibleWithProvider } from '../utils/aiModels'

const providers: { id: AIProvider; label: string; models: string[] }[] = [
  { id: 'openai', label: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4.1-mini'] },
  { id: 'claude', label: 'Anthropic', models: ['claude-3-5-haiku-latest', 'claude-3-7-sonnet-latest'] },
  { id: 'google', label: 'Google', models: ['gemini-2.0-flash', 'gemini-2.5-flash'] },
  { id: 'groq', label: 'Groq', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] },
  { id: 'cerebras', label: 'Cerebras', models: ['llama-3.3-70b'] },
  { id: 'deepseek', label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] },
]
type AgentForm = Pick<AgenteIA, 'nome' | 'provider' | 'modelo'> & { descricao: string; system_prompt: string; max_tokens: number }

export function MeusAgentsPage() {
  const { data: policy, isLoading: policyLoading } = useAIPolicy()
  const { data: myKeys = [] } = useQuery({ queryKey: ['minhas-chaves-ia'], queryFn: configuracoesApi.getMyIaKeys })
  const { data: agents = [], isLoading } = useMeusAgentes()
  const create = useCreateMeuAgente()
  const update = useUpdateMeuAgente()
  const remove = useDeleteMeuAgente()
  const [editing, setEditing] = useState<AgenteIA | null | false>(false)
  const [form, setForm] = useState<AgentForm>({ nome: '', descricao: '', provider: 'openai', modelo: 'gpt-4o-mini', max_tokens: 4096, system_prompt: '' })
  const models = useMemo(() => {
    const allowed = policy?.allowed_models ?? []
    return myKeys.filter((key) => key.is_active).map((key) => ({ id: key.provider, label: providers.find((item) => item.id === key.provider)?.label ?? key.provider, model: key.model }))
      .filter((item) => !allowed.length || allowed.includes(`${item.id}:${item.model}`) || allowed.includes(item.model))
  }, [myKeys, policy?.allowed_models])
  const currentModels = models.filter((item) => item.id === form.provider)
  const allowedProviders = providers.filter((provider) => models.some((item) => item.id === provider.id))
  const canAdd = Boolean(policy?.can_create_agents && models.length > 0 && (policy.max_agents <= 0 || agents.length < policy.max_agents))
  const open = (agent?: AgenteIA) => {
    setEditing(agent ?? null)
    setForm(agent ? { nome: agent.nome, descricao: agent.descricao ?? '', provider: agent.provider, modelo: agent.modelo, max_tokens: agent.max_tokens, system_prompt: agent.system_prompt ?? '' } : { nome: '', descricao: '', provider: models[0]?.id ?? 'openai', modelo: models[0]?.model ?? '', max_tokens: 4096, system_prompt: '' })
  }
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isModelCompatibleWithProvider(form.provider, form.modelo)) return
    if (editing) await update.mutateAsync({ id: editing.id, data: form })
    else await create.mutateAsync(form)
    setEditing(false)
  }

  return <div className="kea-process-page"><TopBar title="" hideModuleBar /><div className="kea-process-content space-y-5">
    <PageBanner section="Inteligência Artificial" title="Meus Agents" description="Crie assistentes personalizados para suas conversas e análises documentais." />
    <div role="note" className="flex gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200"><Sparkles size={18} className="mt-0.5 shrink-0" /><p>A Kealex fornece um pacote inicial de tokens. Após o vencimento/esgotamento destes tokens, o sistema direcionará automaticamente para o modelo mais indicado para que o seu trabalho não seja interrompido.</p></div>
    <DataCard className="p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Agentes personalizados</h2><p className="mt-1 text-xs text-slate-500">{policy ? `${agents.length} de ${policy.max_agents > 0 ? policy.max_agents : 'ilimitados'} agentes usados` : 'Carregando limites do plano...'}</p></div><Button icon={<Plus size={15} />} disabled={!canAdd} onClick={() => open()}>Novo Agent</Button></div>
      {policyLoading || isLoading ? <p className="py-8 text-center text-sm text-slate-500">Carregando...</p> : !policy?.can_create_agents ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Seu plano não habilita a criação de agentes personalizados.</p> : !models.length ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Cadastre e ative uma chave de IA para um modelo permitido pelo seu plano antes de criar agentes.</p> : agents.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Você ainda não criou agentes.</p> : <div className="space-y-3">{agents.map((agent) => <div key={agent.id} className="flex items-start justify-between gap-4 rounded-xl border p-4"><div className="flex gap-3"><Bot className="mt-1 text-indigo-600" size={19} /><div><h3 className="font-semibold">{agent.nome}</h3><p className="mt-1 text-sm text-slate-500">{agent.descricao || 'Sem descrição'} · {agent.provider} / {agent.modelo}</p></div></div><div className="flex gap-2"><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Editar agent" onClick={() => open(agent)}><Pencil size={16} /></button><button className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Excluir agent" onClick={() => confirm('Excluir este agent?') && void remove.mutateAsync(agent.id)}><Trash2 size={16} /></button></div></div>)}</div>}
      {editing !== false && <Modal title={editing ? 'Editar agent' : 'Novo agent'} onClose={() => setEditing(false)}><form onSubmit={(event) => void save(event)} className="space-y-4"><Input label="Nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /><Input label="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /><div className="grid grid-cols-2 gap-3"><Select label="Fabricante" value={form.provider} onChange={(e) => { const provider = e.target.value as AIProvider; setForm({ ...form, provider, modelo: models.find((item) => item.id === provider)?.model ?? '' }) }}>{allowedProviders.map((provider) => <option key={provider.id} value={provider.id}>{provider.label}</option>)}</Select><Select label="Modelo permitido pelo plano" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })}>{currentModels.map((item) => <option key={item.model} value={item.model}>{item.model}</option>)}</Select></div><Textarea label="Persona / instrução de sistema" rows={5} value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} /><div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button><Button type="submit" loading={create.isPending || update.isPending}>Salvar</Button></div></form></Modal>}
    </DataCard>
  </div></div>
}
