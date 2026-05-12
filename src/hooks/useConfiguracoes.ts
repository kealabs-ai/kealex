import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { configuracoesApi, type CfgGeral, type CfgCdn, type CfgDatabase, type CfgIa, type CfgUsuarios, type CfgSeguranca, type CfgNotificacoes, type ModelosDisponiveis } from '../api/configuracoes'

export const CONFIG_KEY = ['configuracoes']

// Geral
export function useConfigGeral() {
  return useQuery({ queryKey: [...CONFIG_KEY, 'geral'], queryFn: configuracoesApi.getGeral })
}

export function useSaveConfigGeral() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: configuracoesApi.saveGeral,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CONFIG_KEY, 'geral'] }),
  })
}

// CDN
export function useConfigCdn() {
  return useQuery({ queryKey: [...CONFIG_KEY, 'cdn'], queryFn: configuracoesApi.getCdn })
}

export function useSaveConfigCdn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: configuracoesApi.saveCdn,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CONFIG_KEY, 'cdn'] }),
  })
}

// Database
export function useConfigDatabase() {
  return useQuery({ queryKey: [...CONFIG_KEY, 'database'], queryFn: configuracoesApi.getDatabase })
}

export function useSaveConfigDatabase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: configuracoesApi.saveDatabase,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CONFIG_KEY, 'database'] }),
  })
}

// IA
export function useConfigIa() {
  const query = useQuery({ queryKey: [...CONFIG_KEY, 'ia'], queryFn: configuracoesApi.getIa })
  const saveConfig = useSaveConfigIa()
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    save: saveConfig.mutateAsync,
    isSaving: saveConfig.isPending,
  }
}

export function useConfigIaAtiva() {
  return useQuery({ 
    queryKey: [...CONFIG_KEY, 'ia', 'ativa'], 
    queryFn: configuracoesApi.getIaAtiva,
    retry: false,
    staleTime: 0,
    refetchOnMount: true
  })
}

export function useModelosDisponiveis() {
  return useQuery({ 
    queryKey: [...CONFIG_KEY, 'ia', 'modelos'], 
    queryFn: configuracoesApi.getModelosDisponiveis,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  })
}

export function useSaveConfigIa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: configuracoesApi.saveIa,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CONFIG_KEY, 'ia'] })
      qc.invalidateQueries({ queryKey: [...CONFIG_KEY, 'ia', 'ativa'] })
    },
  })
}

// Usuários
export function useConfigUsuarios() {
  return useQuery({ queryKey: [...CONFIG_KEY, 'usuarios'], queryFn: configuracoesApi.getUsuarios })
}

export function useSaveConfigUsuarios() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: configuracoesApi.saveUsuarios,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CONFIG_KEY, 'usuarios'] }),
  })
}

// Segurança
export function useConfigSeguranca() {
  return useQuery({ queryKey: [...CONFIG_KEY, 'seguranca'], queryFn: configuracoesApi.getSeguranca })
}

export function useSaveConfigSeguranca() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: configuracoesApi.saveSeguranca,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CONFIG_KEY, 'seguranca'] }),
  })
}

// Notificações
export function useConfigNotificacoes() {
  return useQuery({ queryKey: [...CONFIG_KEY, 'notificacoes'], queryFn: configuracoesApi.getNotificacoes })
}

export function useSaveConfigNotificacoes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: configuracoesApi.saveNotificacoes,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CONFIG_KEY, 'notificacoes'] }),
  })
}
