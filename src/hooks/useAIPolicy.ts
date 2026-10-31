import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiPolicyApi } from '../api/aiPolicy'

export function useAIPolicy() {
  return useQuery({ queryKey: ['ai-policy', 'effective'], queryFn: aiPolicyApi.effective })
}

export function useAIPlanPolicies() {
  return useQuery({ queryKey: ['ai-policy', 'plans'], queryFn: aiPolicyApi.listPlans })
}

export function useSaveAIPlanPolicy() {
  const client = useQueryClient()
  return useMutation({ mutationFn: aiPolicyApi.savePlan, onSuccess: () => client.invalidateQueries({ queryKey: ['ai-policy'] }) })
}

export function useSaveAIUserPolicy() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, policy }: { userId: string; policy: Parameters<typeof aiPolicyApi.saveUser>[1] }) =>
      aiPolicyApi.saveUser(userId, policy),
    onSuccess: (_data, variables) => client.invalidateQueries({ queryKey: ['ai-policy', 'user', variables.userId] }),
  })
}
