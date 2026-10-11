import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logotipo_kealex.png'
import { assinaturaApi } from '../api/assinatura'
import type { Periodicidade } from '../api/assinatura'
import { AssinaturaModal } from '../components/AssinaturaModal'

type LocationState = { plano?: 'starter' | 'professional'; periodicidade?: Periodicidade; statusGateway?: string } | null

const STATUS_MSGS: Record<string, { icon: typeof AlertCircle; cor: string; titulo: string; msg: string }> = {
  PENDING: { icon: Clock, cor: 'amber', titulo: 'Pagamento pendente', msg: 'Seu pagamento ainda está sendo processado. Aguarde ou tente novamente.' },
  AWAITING_RISK_ANALYSIS: { icon: Clock, cor: 'amber', titulo: 'Em análise', msg: 'Seu pagamento está em análise de risco. Aguarde a confirmação.' },
  DECLINED: { icon: XCircle, cor: 'red', titulo: 'Pagamento recusado', msg: 'Seu cartão foi recusado pelo banco. Verifique os dados ou use outro cartão.' },
  REFUSED: { icon: XCircle, cor: 'red', titulo: 'Pagamento recusado', msg: 'Seu cartão foi recusado pelo banco. Verifique os dados ou use outro cartão.' },
  CANCELED: { icon: XCircle, cor: 'red', titulo: 'Pagamento cancelado', msg: 'O pagamento foi cancelado. Tente novamente.' },
  OVERDUE: { icon: AlertCircle, cor: 'red', titulo: 'Pagamento expirado', msg: 'O prazo para pagamento expirou. Tente novamente.' },
}

function getStatusInfo(status?: string) {
  if (!status) return STATUS_MSGS.DECLINED
  return STATUS_MSGS[status.toUpperCase()] ?? { icon: AlertCircle, cor: 'red', titulo: 'Pagamento não confirmado', msg: `Pagamento não aprovado (status: ${status}). Verifique os dados e tente novamente.` }
}

export function PagamentoPendentePage() {
  const { logout, user, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState) ?? {}
  const planoPreservado = state.plano ?? 'professional'
  const periodicidadePreservada = state.periodicidade ?? 'mensal'
  const statusGateway = state.statusGateway
  const statusInfo = getStatusInfo(statusGateway)
  const StatusIcon = statusInfo.icon
  const corClasse = statusInfo.cor === 'amber' ? { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', titulo: 'text-amber-800', msg: 'text-amber-700' } : { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', titulo: 'text-red-800', msg: 'text-red-700' }
  const [assinaturaOpen, setAssinaturaOpen] = useState(false)

  const { data: billingStatus, isFetching } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: Boolean(user),
    refetchInterval: 10_000,
  })

  // Se o pagamento foi confirmado externamente, libera acesso
  if (billingStatus?.status === 'active') {
    if (user?.plano !== billingStatus.plano) updateUser({ plano: billingStatus.plano as any })
    navigate('/processos', { replace: true })
    return null
  }

  function handleLogout() {
    logout()
    navigate('/entrar', { replace: true })
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link to="/">
            <img src={logo} alt="Kealex" className="h-8 w-auto object-contain mx-auto mb-8" />
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className={`w-14 h-14 rounded-2xl ${corClasse.bg} ${corClasse.border} border flex items-center justify-center mx-auto mb-5`}>
              <StatusIcon size={24} className={corClasse.icon} />
            </div>

            <h1 className="text-2xl font-extrabold text-[#081B33] mb-2">{statusInfo.titulo}</h1>
            <p className="text-sm text-[#596B82] mb-6">{statusInfo.msg}</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">O que pode ter ocorrido</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="shrink-0 mt-0.5 text-slate-400" /> Dados do cartão incorretos (número, validade ou CVV)</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="shrink-0 mt-0.5 text-slate-400" /> Cartão sem limite disponível</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="shrink-0 mt-0.5 text-slate-400" /> Cartão bloqueado pelo banco emissor</li>
              </ul>
            </div>

            <button
              onClick={() => setAssinaturaOpen(true)}
              className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 mb-3"
            >
              Tentar novamente
            </button>

            <button
              onClick={handleLogout}
              disabled={isFetching}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all"
            >
              {isFetching ? <><RefreshCw size={12} className="animate-spin" /> Verificando pagamento...</> : 'Sair da conta'}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Precisa de ajuda?{' '}
            <a href="mailto:suporte@kealabs.com.br" className="text-[#00C2A8] hover:underline">
              suporte@kealabs.com.br
            </a>
          </p>
        </motion.div>
      </div>

      {user && assinaturaOpen && (
        <AssinaturaModal
          open
          planoInicial={planoPreservado}
          periodicidadeInicial={periodicidadePreservada}
          onClose={() => setAssinaturaOpen(false)}
        />
      )}
    </>
  )
}
