import axios from 'axios'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bot, Save, Users } from 'lucide-react'
import { Button, Input, Select } from './UI'
import { DataCard } from './Cards'
import {
  useAIPolicy,
  useAIPlanPolicies,
  useSaveAIPlanPolicy,
  useSaveAIUserPolicy,
} from '../hooks/useAIPolicy'
import { aiPolicyApi, type AIUserPolicy, type AIPolicy } from '../api/aiPolicy'
import { useUsuarios } from '../hooks/useUsuarios'
import { useToast } from './Toast'
import type { Role } from '../types'

const modelOptions = [
  'openai:gpt-4o-mini', 'openai:gpt-4.1-mini', 'claude:claude-3-5-haiku-latest', 'claude:claude-3-7-sonnet-latest',
  'google:gemini-2.0-flash', 'google:gemini-2.5-flash', 'groq:llama-3.3-70b-versatile', 'groq:llama-3.1-8b-instant',
  'cerebras:llama-3.3-70b', 'deepseek:deepseek-chat', 'deepseek:deepseek-reasoner',
]
const menuGroups = [
  {
    title: 'Operação jurídica',
    items: [
      ['/processos', 'Processos'], ['/documentos', 'Documentos'], ['/prazos', 'Prazos'], ['/atividades', 'Atividades'],
    ],
  },
  {
    title: 'Gestão',
    items: [
      ['/financeiro', 'Financeiro'], ['/cobranca', 'Cobrança'], ['/usuarios', 'Usuários'], ['/equipe', 'Equipe'],
      ['/clientes', 'Clientes'], ['/intimacoes', 'Intimações'], ['/audiencias', 'Audiências'],
      ['/integracao-orgaos', 'Integração com órgãos'],
    ],
  },
  {
    title: 'Inteligência artificial',
    items: [
      ['/ia', 'Kealex AI Hub'], ['/analise-documentos', 'Análise de Documentos'],
      ['/meus-agents', 'Meus Agents'], ['/configuracoes/ia', 'Minhas chaves de IA'],
    ],
  },
] as const
const roles: Role[] = ['advogado', 'juridico', 'escritorio', 'cliente']

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ detail?: string; message?: string }>(error)) {
    return error.response?.data?.detail || error.response?.data?.message || error.message
  }
  return error instanceof Error ? error.message : 'Não foi possível salvar as permissões.'
}

export function AIPoliciesTab() {
  const { data: policies, isLoading, isError, error } = useAIPlanPolicies()
  const { data: effectivePolicy, isError: effectivePolicyError, error: effectivePolicyLoadError } = useAIPolicy()
  const savePlan = useSaveAIPlanPolicy()
  const saveUserPolicy = useSaveAIUserPolicy()
  const { data: users = [], isError: usersError } = useUsuarios()
  const { success, error: toastError } = useToast()
  const [requestedPlanKey, setRequestedPlanKey] = useState<string | null>(null)
  const [editedPlan, setEditedPlan] = useState<{ key: string; policy: AIPolicy } | null>(null)
  const [userId, setUserId] = useState('')
  const [editedUserPolicy, setEditedUserPolicy] = useState<{ userId: string; policy: AIUserPolicy } | null>(null)
  const userPolicy = useQuery({
    queryKey: ['ai-policy', 'user', userId],
    queryFn: () => aiPolicyApi.getUser(userId),
    enabled: Boolean(userId),
  })
  const selectedPlan = policies?.find((item) => item.plan_key === (requestedPlanKey ?? effectivePolicy?.plan_key))
    ?? policies?.find((item) => item.plan_key === 'trial')
    ?? policies?.[0]
  const planKey = selectedPlan?.plan_key ?? 'trial'
  const draft = editedPlan?.key === planKey ? editedPlan.policy : selectedPlan ?? null
  const tenantPlan = policies?.find((item) => item.plan_key === effectivePolicy?.plan_key)
  const selectedUser = users.find((user) => user.id === userId)
  const fetchedUserPolicy: AIUserPolicy | null = userPolicy.data ? {
    can_create_agents: userPolicy.data.can_create_agents,
    max_agents: userPolicy.data.max_agents,
    monthly_token_limit: userPolicy.data.monthly_token_limit,
    allowed_models: userPolicy.data.allowed_models,
    allowed_menus: userPolicy.data.allowed_menus,
  } : null
  const userDraft = editedUserPolicy?.userId === userId ? editedUserPolicy.policy : fetchedUserPolicy
  const userPlanCanCreateAgents = Boolean(
    tenantPlan?.can_create_agents && selectedUser && tenantPlan.allowed_roles.includes(selectedUser.role),
  )

  const updatePlanDraft = (changes: Partial<AIPolicy>) => {
    if (!draft) return
    setEditedPlan({ key: planKey, policy: { ...draft, ...changes } })
  }

  const togglePlanList = (key: 'allowed_models' | 'allowed_menus' | 'allowed_roles', value: string) => {
    if (!draft) return
    const current = draft[key]
    updatePlanDraft({
      [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    })
  }

  const updateUserDraft = <K extends keyof AIUserPolicy>(key: K, value: AIUserPolicy[K]) => {
    if (!userDraft) return
    setEditedUserPolicy({ userId, policy: { ...userDraft, [key]: value } })
  }

  const toggleUserMenu = (path: string) => {
    if (!userDraft?.allowed_menus) return
    const current = userDraft.allowed_menus
    updateUserDraft('allowed_menus', current.includes(path)
      ? current.filter((item) => item !== path)
      : [...current, path])
  }

  const saveSelectedPlan = async () => {
    if (!draft) return
    try {
      await savePlan.mutateAsync(draft)
      setEditedPlan((current) => current?.key === planKey ? null : current)
      success('Permissões padrão do plano salvas.')
    } catch (saveError) {
      toastError(getErrorMessage(saveError))
    }
  }

  const saveSelectedUser = async () => {
    if (!userId || !userDraft) return
    try {
      const saved = await saveUserPolicy.mutateAsync({ userId, policy: userDraft })
      setEditedUserPolicy({ userId, policy: saved })
      success('Permissões individuais salvas.')
    } catch (saveError) {
      toastError(getErrorMessage(saveError))
    }
  }

  if (isLoading) return <DataCard className="p-6 text-sm text-slate-500">Carregando políticas de acesso...</DataCard>
  if (isError) return <DataCard className="p-6 text-sm text-red-600">Não foi possível carregar as políticas: {getErrorMessage(error)}</DataCard>
  if (!policies?.length || !draft) return <DataCard className="p-6 text-sm text-slate-500">Nenhum plano de acesso foi encontrado.</DataCard>

  return (
    <div className="space-y-5">
      <DataCard className="space-y-5 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold"><Bot size={17} />Permissões padrão por plano</h2>
            <p className="mt-1 max-w-3xl text-xs text-slate-500">
              Estas permissões são herdadas por usuários atuais sem exceção e por novos usuários do plano.
              Uma exceção individual substitui somente os campos personalizados.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Select label="Plano" value={planKey} onChange={(event) => setRequestedPlanKey(event.target.value)}>
              {policies.map((item) => (
                <option key={item.plan_key} value={item.plan_key}>{item.plan_label || item.plan_key}</option>
              ))}
            </Select>
            <Button icon={<Save size={15} />} loading={savePlan.isPending} onClick={() => void saveSelectedPlan()}>
              Salvar padrão
            </Button>
          </div>
        </div>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Acesso aos módulos</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {menuGroups.map((group) => (
              <fieldset key={group.title} className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <legend className="px-1 text-sm font-medium">{group.title}</legend>
                {group.items.map(([path, label]) => (
                  <label key={path} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowed_menus.includes(path)}
                      onChange={() => togglePlanList('allowed_menus', path)}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            O acesso continua sujeito ao perfil do usuário e às regras próprias de cada módulo.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-slate-500">Uso de inteligência artificial</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.can_create_agents}
              onChange={(event) => updatePlanDraft({ can_create_agents: event.target.checked })}
            />
            Permitir criação de agents personalizados
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Máximo de agents (0 = ilimitado)"
              type="number"
              min={0}
              value={draft.max_agents}
              onChange={(event) => updatePlanDraft({ max_agents: Number(event.target.value) })}
            />
            <Input
              label="Tokens mensais (0 = sem limite)"
              type="number"
              min={0}
              value={draft.monthly_token_limit}
              onChange={(event) => updatePlanDraft({ monthly_token_limit: Number(event.target.value) })}
            />
          </div>
          <div>
            <h4 className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">Perfis autorizados a criar agents</h4>
            <div className="flex flex-wrap gap-3">
              {roles.map((role) => (
                <label key={role} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.allowed_roles.includes(role)}
                    onChange={() => togglePlanList('allowed_roles', role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">Modelos liberados (lista vazia = todos)</h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {modelOptions.map((model) => (
                <label key={model} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.allowed_models.includes(model)}
                    onChange={() => togglePlanList('allowed_models', model)}
                  />
                  {model}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Fabricante de continuidade"
              value={draft.fallback_provider || ''}
              onChange={(event) => updatePlanDraft({ fallback_provider: event.target.value || null, fallback_model: null })}
            >
              <option value="">Sem fallback</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Anthropic</option>
              <option value="google">Google</option>
              <option value="groq">Groq</option>
              <option value="cerebras">Cerebras</option>
              <option value="deepseek">DeepSeek</option>
            </Select>
            <Input
              label="Modelo de continuidade"
              value={draft.fallback_model || ''}
              onChange={(event) => updatePlanDraft({ fallback_model: event.target.value || null })}
              placeholder="ex.: gpt-4o-mini"
            />
          </div>
          <p className="text-xs text-slate-500">
            O fallback requer uma chave pessoal cadastrada para o fabricante e modelo escolhidos.
          </p>
        </section>
      </DataCard>

      <DataCard className="space-y-4 p-5">
        <div>
          <h2 className="flex items-center gap-2 font-semibold"><Users size={17} />Exceções para usuários existentes</h2>
          <p className="mt-1 text-xs text-slate-500">
            Selecione um usuário para personalizar seus acessos. Campos marcados para herdar acompanham o plano atual,
            inclusive quando o plano mudar.
          </p>
        </div>
        {usersError ? (
          <p className="text-sm text-red-600">Não foi possível carregar a lista de usuários.</p>
        ) : effectivePolicyError ? (
          <p className="text-sm text-red-600">
            Não foi possível identificar o plano atual para calcular as permissões herdadas: {getErrorMessage(effectivePolicyLoadError)}
          </p>
        ) : !tenantPlan ? (
          <p className="text-sm text-slate-500">Carregando o plano atual para calcular as permissões herdadas...</p>
        ) : (
          <div className="grid gap-3">
            <Select
              label="Usuário"
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value)
              }}
            >
              <option value="">Selecione...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.nome} · {user.email}</option>
              ))}
            </Select>

            {userId && userPolicy.isLoading && (
              <p className="text-sm text-slate-500">Carregando permissões do usuário...</p>
            )}
            {userId && userPolicy.isError && (
              <p className="text-sm text-red-600">Não foi possível carregar as permissões: {getErrorMessage(userPolicy.error)}</p>
            )}
            {userId && userDraft && tenantPlan && selectedUser && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Criação de agents"
                    value={userDraft.can_create_agents === null ? 'inherit' : String(userDraft.can_create_agents)}
                    onChange={(event) => updateUserDraft(
                      'can_create_agents',
                      event.target.value === 'inherit' ? null : event.target.value === 'true',
                    )}
                  >
                    <option value="inherit">Herdar do plano ({userPlanCanCreateAgents ? 'permitir' : 'bloquear'})</option>
                    <option value="true">Permitir para este usuário</option>
                    <option value="false">Bloquear para este usuário</option>
                  </Select>
                  <div className="flex items-end">
                    <p className="pb-2 text-xs text-slate-500">
                      O perfil {selectedUser.role} {tenantPlan.allowed_roles.includes(selectedUser.role) ? 'está' : 'não está'} autorizado pelo plano.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={userDraft.max_agents === null}
                        onChange={(event) => updateUserDraft('max_agents', event.target.checked ? null : tenantPlan.max_agents)}
                      />
                      Herdar limite de agents do plano ({tenantPlan.max_agents})
                    </label>
                    <Input
                      label="Limite individual (0 = ilimitado)"
                      type="number"
                      min={0}
                      disabled={userDraft.max_agents === null}
                      value={userDraft.max_agents ?? tenantPlan.max_agents}
                      onChange={(event) => updateUserDraft('max_agents', Number(event.target.value))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={userDraft.monthly_token_limit === null}
                        onChange={(event) => updateUserDraft('monthly_token_limit', event.target.checked ? null : tenantPlan.monthly_token_limit)}
                      />
                      Herdar cota de tokens do plano ({tenantPlan.monthly_token_limit})
                    </label>
                    <Input
                      label="Cota mensal individual (0 = sem limite)"
                      type="number"
                      min={0}
                      disabled={userDraft.monthly_token_limit === null}
                      value={userDraft.monthly_token_limit ?? tenantPlan.monthly_token_limit}
                      onChange={(event) => updateUserDraft('monthly_token_limit', Number(event.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={userDraft.allowed_models === null}
                      onChange={(event) => updateUserDraft('allowed_models', event.target.checked ? null : [...tenantPlan.allowed_models])}
                    />
                    Herdar modelos do plano
                  </label>
                  <Input
                    label="Modelos autorizados (provider:model, separados por vírgula)"
                    value={(userDraft.allowed_models ?? tenantPlan.allowed_models).join(', ')}
                    disabled={userDraft.allowed_models === null}
                    onChange={(event) => updateUserDraft(
                      'allowed_models',
                      event.target.value.split(',').map((value) => value.trim()).filter(Boolean),
                    )}
                    placeholder="Lista vazia = todos os modelos"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Com a exceção personalizada ativa, uma lista vazia libera todos os modelos.
                  </p>
                </div>

                <section>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={userDraft.allowed_menus === null}
                      onChange={(event) => updateUserDraft('allowed_menus', event.target.checked ? null : [...tenantPlan.allowed_menus])}
                    />
                    Herdar acessos aos módulos do plano
                  </label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {menuGroups.map((group) => (
                      <fieldset key={group.title} className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <legend className="px-1 text-sm font-medium">{group.title}</legend>
                        {group.items.map(([path, label]) => (
                          <label key={path} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              disabled={userDraft.allowed_menus === null}
                              checked={(userDraft.allowed_menus ?? tenantPlan.allowed_menus).includes(path)}
                              onChange={() => toggleUserMenu(path)}
                            />
                            {label}
                          </label>
                        ))}
                      </fieldset>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    As regras fixas de perfil do sistema continuam valendo; uma permissão de módulo não concede acesso a outro perfil.
                  </p>
                </section>

                <div>
                  <Button
                    icon={<Save size={15} />}
                    loading={saveUserPolicy.isPending}
                    disabled={userPolicy.isLoading || !userDraft}
                    onClick={() => void saveSelectedUser()}
                  >
                    Salvar permissões do usuário
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DataCard>
    </div>
  )
}
