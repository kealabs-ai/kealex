import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock, XCircle, AlertCircle, Loader2, RefreshCw, Copy, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { assinaturaApi, PLANOS_CONFIG, ASAAS_STATUS_APROVADO } from '../api/assinatura'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

interface Props {
  onNovaCotratacao?: () => void
  onClose?: () => void
}

type Cenario = 'ativa' | 'pendente' | 'recusada' | 'cancelada' | 'desconhecido'

function resolverCenario(billing: { status: string; subscriptionStatus: string | null }): Cenario {
  const s = (billing.status ?? '').toLowerCase()
  const ss = (billing.subscriptionStatus ?? '').toUpperCase()
  if (s === 'active' || ASAAS_STATUS_APROVADO.has(ss)) return 'ativa'
  if (s === 'pending' || ['PENDING', 'AWAITING_RISK_ANALYSIS'].includes(ss)) return 'pendente'
  if (s === 'canceled' || ['CANCELED', 'CANCELLED'].includes(ss)) return 'cancelada'
  if (['DECLINED', 'REFUSED', 'OVERDUE', 'EXPIRED', 'past_due'].includes(s) || ['DECLINED', 'REFUSED', 'OVERDUE', 'EXPIRED'].includes(ss)) return 'recusada'
  return 'desconhecido'
}

const CENARIO_CONFIG = {
  ativa: {
    icon: CheckCircle2,
    cor: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', titulo: 'text-emerald-800', msg: 'text-emerald-700' },
    titulo: 'Você já possui uma assinatura ativa.',
    msg: 'Seu acesso está liberado. Acesse a plataforma ou gerencie sua assinatura.',
  },
  pendente: {
    icon: Clock,
    cor: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', titulo: 'text-amber-800', msg: 'text-amber-700' },
    titulo: 'Identificamos uma assinatura aguardando a confirmação do pagamento.',
    msg: 'Não criamos uma nova cobrança. Continue o pagamento existente.',
  },
  recusada: {
    icon: XCircle,
    cor: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', titulo: 'text-red-800', msg: 'text-red-700' },
    titulo: 'Seu pagamento foi recusado ou expirou.',
    msg: 'Tente novamente com os mesmos dados ou inicie uma nova contratação.',
  },
  cancelada: {
    icon: AlertCircle,
    cor: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-500', titulo: 'text-slate-800', msg: 'text-slate-600' },
    titulo: 'Existe um registro de assinatura cancelada.',
    msg: 'Você pode contratar um novo plano quando quiser.',
  },
  desconhecido: {
    icon: AlertCircle,
    cor: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-500', titulo: 'text-slate-800', msg: 'text-slate-600' },
    titulo: 'Já existe uma assinatura vinculada a esta conta.',
    msg: 'Verifique o status abaixo e escolha como prosseguir.',
  },
}

function fmtValor(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

function fmtData(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function PlanoNome({ plano }: { plano: string }) {
  const cfg = PLANOS_CONFIG.find((p) => p.id === plano)
  return <>{cfg?.nome ?? plano}</>
}

export function AssinaturaExistente({ onNovaCotratacao, onClose }: Props) {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { error: toastError, success: toastSuccess } = useToast()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: assinatura, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['assinatura-existente', user?.tenantId],
    queryFn: () => assinaturaApi.getAssinatura().catch((err) => {
      if (err?.response?.status === 404) return null
      throw err
    }),
    enabled: Boolean(user),
    staleTime: 30_000,
  })

  const { data: billingStatus, refetch: refetchBilling, isFetching: isFetchingBilling } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: Boolean(user),
    staleTime: 0,
    refetchInterval: (query) => {
      const s = (query.state.data?.status ?? '').toLowerCase()
      return s === 'pending' ? 8_000 : false
    },
  })

  const reativar = useMutation({
    mutationFn: () => assinaturaApi.reativarAssinatura(assinatura!.subscriptionId),
    onSuccess: (data) => {
      if (ASAAS_STATUS_APROVADO.has(data.status?.toUpperCase())) {
        updateUser({ plano: data.plano as any })
        queryClient.invalidateQueries({ queryKey: ['billing-status'] })
        toastSuccess('Pagamento confirmado! Acesso liberado.')
        navigate('/processos', { replace: true })
      } else {
        toastError('Pagamento não confirmado. Tente novamente ou use outro cartão.')
      }
    },
    onError: () => toastError('Não foi possível reativar. Tente novamente.'),
  })

  // Redireciona automaticamente quando o billing confirmar pagamento
  useEffect(() => {
    if (billingStatus?.status === 'active') {
      updateUser({ plano: billingStatus.plano as any, subscriptionStatus: 'active' })
      toastSuccess('Pagamento confirmado! Acesso liberado.')
      navigate('/processos', { replace: true })
    }
  }, [billingStatus?.status])

  if (isLoading && !billingStatus) {
    return (
      <div className="flex flex-col items-center py-10 gap-3">
        <Loader2 size={28} className="animate-spin text-[#00C2A8]" />
        <p className="text-sm text-slate-500">Verificando assinatura existente...</p>
      </div>
    )
  }

  const cenario = assinatura
    ? resolverCenario({ status: assinatura.status, subscriptionStatus: assinatura.subscriptionStatus })
    : billingStatus
    ? resolverCenario({ status: billingStatus.status, subscriptionStatus: billingStatus.subscriptionStatus })
    : 'desconhecido'

  const cfg = CENARIO_CONFIG[cenario]
  const Icon = cfg.icon
  const c = cfg.cor

  return (
    <div>
      {/* Status banner */}
      <div className={`${c.bg} ${c.border} border rounded-xl p-4 mb-4 flex items-start gap-3`}>
        <Icon size={20} className={`${c.icon} shrink-0 mt-0.5`} />
        <div>
          <p className={`text-sm font-semibold ${c.titulo}`}>{cfg.titulo}</p>
          <p className={`text-xs mt-0.5 ${c.msg}`}>{cfg.msg}</p>
        </div>
      </div>

      {/* Detalhes da assinatura */}
      {assinatura && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <Row label="Plano" value={<PlanoNome plano={assinatura.plano} />} />
          <Row label="Periodicidade" value={assinatura.periodicidade === 'trimestral' ? 'Trimestral (3 meses)' : 'Mensal'} />
          <Row label="Valor" value={fmtValor(assinatura.valor)} />
          <Row label="Status" value={<StatusBadge cenario={cenario} subscriptionStatus={assinatura.subscriptionStatus} />} />
          <Row label="Criada em" value={fmtData(assinatura.createdAt)} />
          {assinatura.nextDueDate && <Row label="Próximo vencimento" value={fmtData(assinatura.nextDueDate)} />}
        </div>
      )}

      {/* PIX pendente */}
      {cenario === 'pendente' && assinatura?.pixKey && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-slate-500 mb-1">Chave PIX (copia e cola)</p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono text-[#081B33] flex-1 truncate">{assinatura.pixKey}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(assinatura.pixKey!); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="shrink-0 p-1.5 rounded-lg bg-[#00C2A8]/10 hover:bg-[#00C2A8]/20 text-[#00C2A8]"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      )}

      {/* Ações por cenário */}
      <div className="space-y-2">
        {cenario === 'ativa' && (
          <>
            <button
              onClick={() => navigate('/processos', { replace: true })}
              className="w-full bg-[#00C2A8] hover:bg-[#00a896] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} /> Acessar plataforma
            </button>
            <button
              onClick={() => { onClose?.(); navigate('/trial-expirado') }}
              className="w-full border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50"
            >
              Gerenciar assinatura
            </button>
          </>
        )}

        {cenario === 'pendente' && (
          <>
            <button
              onClick={() => navigate('/pagamento-pendente', { state: { plano: assinatura?.plano, periodicidade: assinatura?.periodicidade } })}
              className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              Continuar pagamento
            </button>
            <button
              onClick={async () => { await Promise.all([refetch(), refetchBilling()]) }}
              disabled={isFetching || isFetchingBilling}
              className="w-full border border-slate-200 text-slate-500 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              {(isFetching || isFetchingBilling) ? <><Loader2 size={12} className="animate-spin" /> Verificando...</> : <><RefreshCw size={12} /> Verificar status do pagamento</>}
            </button>
          </>
        )}

        {cenario === 'recusada' && (
          <>
            <button
              onClick={() => reativar.mutate()}
              disabled={reativar.isPending}
              className="w-full bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              {reativar.isPending ? <><Loader2 size={15} className="animate-spin" /> Processando...</> : 'Tentar novamente o pagamento'}
            </button>
            {onNovaCotratacao && (
              <button
                onClick={onNovaCotratacao}
                className="w-full border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50"
              >
                Nova contratação
              </button>
            )}
          </>
        )}

        {(cenario === 'cancelada' || cenario === 'desconhecido') && onNovaCotratacao && (
          <button
            onClick={onNovaCotratacao}
            className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl text-sm"
          >
            Contratar novo plano
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="font-semibold text-[#081B33] text-xs">{value}</span>
    </div>
  )
}

function StatusBadge({ cenario, subscriptionStatus }: { cenario: Cenario; subscriptionStatus: string }) {
  const map: Record<Cenario, { label: string; cls: string }> = {
    ativa: { label: 'Ativa', cls: 'bg-emerald-100 text-emerald-700' },
    pendente: { label: 'Pendente', cls: 'bg-amber-100 text-amber-700' },
    recusada: { label: subscriptionStatus || 'Recusada', cls: 'bg-red-100 text-red-700' },
    cancelada: { label: 'Cancelada', cls: 'bg-slate-100 text-slate-600' },
    desconhecido: { label: subscriptionStatus || 'Desconhecido', cls: 'bg-slate-100 text-slate-600' },
  }
  const { label, cls } = map[cenario]
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{label}</span>
}
