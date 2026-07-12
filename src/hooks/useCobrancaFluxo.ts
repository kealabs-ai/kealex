import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cobrancasApi } from '../api/cobrancas'

const QK = 'cobrancas'

export function useCobrancas() {
  return useQuery({ queryKey: [QK], queryFn: cobrancasApi.list })
}

export function useCobranca(id?: string) {
  return useQuery({
    queryKey: [QK, id],
    queryFn: () => cobrancasApi.get(id!),
    enabled: !!id,
  })
}

export function useCobrancaTimeline(id?: string) {
  return useQuery({
    queryKey: [QK, id, 'timeline'],
    queryFn: () => cobrancasApi.timeline(id!),
    enabled: !!id,
  })
}

function useCobrancaMutation<T>(mutationFn: (arg: T) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  })
}

export function useCreateCobranca() {
  return useCobrancaMutation(cobrancasApi.create)
}

export function useProximaFase() {
  return useCobrancaMutation((id: string) => cobrancasApi.proximaFase(id))
}

export function useMarcarPago() {
  return useCobrancaMutation(({ id, observacao }: { id: string; observacao?: string }) =>
    cobrancasApi.marcarPago(id, observacao),
  )
}

export function useCancelarCobranca() {
  return useCobrancaMutation(({ id, motivo }: { id: string; motivo?: string }) =>
    cobrancasApi.cancelar(id, motivo),
  )
}
