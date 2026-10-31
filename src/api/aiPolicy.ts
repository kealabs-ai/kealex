import { api } from './client'

export type AIPolicy = {
  plan_key: string
  plan_label?: string
  can_create_agents: boolean
  allowed_roles: string[]
  max_agents: number
  allowed_models: string[]
  allowed_menus: string[]
  monthly_token_limit: number
  fallback_provider: string | null
  fallback_model: string | null
  tokens_used?: number
}
export type AIUserPolicy = {
  can_create_agents: boolean | null
  max_agents: number | null
  monthly_token_limit: number | null
  allowed_models: string[] | null
  allowed_menus: string[] | null
}

export type AIUserPolicyInput = Partial<AIUserPolicy>

export const aiPolicyApi = {
  effective: () => api.get<AIPolicy>('/k1/lex/ia/politica').then((r) => r.data),
  listPlans: () => api.get<AIPolicy[]>('/k1/lex/ia/admin/politicas').then((r) => r.data),
  savePlan: (plan: AIPolicy) => api.put<AIPolicy>(`/k1/lex/ia/admin/politicas/${plan.plan_key}`, plan).then((r) => r.data),
  getUser: (userId: string) => api.get<AIUserPolicy & { user_id: string }>(`/k1/lex/ia/admin/usuarios/${userId}`).then((r) => r.data),
  saveUser: (userId: string, policy: AIUserPolicyInput) => api.put<AIUserPolicy & { user_id: string }>(`/k1/lex/ia/admin/usuarios/${userId}`, policy).then((r) => r.data),
}
