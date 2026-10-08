import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logotipo_kealex.png'
import { PLANOS_CONFIG } from '../api/assinatura'
import { assinaturaApi } from '../api/assinatura'
import { AssinaturaModal } from '../components/AssinaturaModal'

export function TrialExpiradoPage() {
  const { logout, user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [assinaturaOpen, setAssinaturaOpen] = useState(false)
  const [planoSelecionado, setPlanoSelecionado] = useState<'starter' | 'professional'>('professional')
  const { data: billingStatus } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: Boolean(user),
    refetchInterval: user ? 10000 : false,
  })
  const billingBlocked = billingStatus?.status === 'pending' || billingStatus?.status === 'past_due'
  const isPendingPayment = user?.plano === 'pending' || billingStatus?.status === 'pending'

  useEffect(() => {
    if (user && billingStatus?.status === 'active') {
      if (user.plano !== billingStatus.plano) updateUser({ plano: billingStatus.plano as typeof user.plano })
      navigate('/processos', { replace: true })
    } else if (user && billingStatus?.status === 'trial') {
      navigate('/processos', { replace: true })
    }
  }, [billingStatus, user, updateUser, navigate])

  function handleLogout() {
    logout()
    navigate('/entrar', { replace: true })
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <motion.div
          className="w-full max-w-lg text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link to="/">
            <img src={logo} alt="Kealex" className="h-8 w-auto object-contain mx-auto mb-8" />
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
              <Lock size={24} className="text-amber-500" />
            </div>

            <h1 className="text-2xl font-extrabold text-[#081B33] mb-2">
              {isPendingPayment ? 'Pagamento não confirmado' : 'Seu trial de 7 dias encerrou'}
            </h1>
            <p className="text-sm text-[#596B82] mb-6">
              {isPendingPayment
                ? 'Não foi possível confirmar o pagamento. Retorne e tente novamente com outro cartão ou verifique os dados informados.'
                : 'Para continuar usando o Kealex, escolha um plano abaixo. Seus dados estao salvos e prontos para uso.'}
            </p>

            {billingStatus?.status === 'pending' && (
              <div role="status" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                Estamos aguardando a confirmação do pagamento. Esta página verifica o status automaticamente.
              </div>
            )}
            {billingStatus?.status === 'past_due' && (
              <div role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
                Não identificamos o pagamento da última cobrança. Atualize a forma de pagamento ou fale com o suporte.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              {PLANOS_CONFIG.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={billingBlocked}
                  onClick={() => {
                    if (user) {
                      setPlanoSelecionado(p.id)
                      setAssinaturaOpen(true)
                    } else {
                      navigate(`/assinar?plano=${p.id}`)
                    }
                  }}
                  className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    p.destaque
                      ? 'border-[#00C2A8] bg-[#00C2A8]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {p.destaque && (
                    <span className="text-[10px] font-bold text-[#00C2A8] uppercase tracking-wide block mb-1">
                      Popular
                    </span>
                  )}
                  <p className="text-sm font-bold text-[#081B33]">{p.nome}</p>
                  <p className="text-lg font-extrabold text-[#081B33] mt-1">
                    R$ {p.valor.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs text-[#596B82]">/mes</p>
                  <ul className="mt-2 space-y-1">
                    {p.recursos.slice(0, 2).map((r) => (
                      <li key={r} className="flex items-center gap-1 text-xs text-slate-500">
                        <CheckCircle2 size={10} className="text-[#00C2A8] shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <button
              disabled={billingBlocked}
              onClick={() => {
                if (user) {
                  setPlanoSelecionado('professional')
                  setAssinaturaOpen(true)
                } else {
                  navigate('/assinar')
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-orange-100 text-sm"
            >
              {billingStatus?.status === 'pending' ? 'Aguardando confirmação' : billingStatus?.status === 'past_due' ? 'Fale com o suporte para regularizar' : 'Assinar agora e continuar'}
            </button>

            <div className="flex items-center gap-2 justify-center mt-4 text-xs text-[#596B82]">
              <CheckCircle2 size={13} className="text-[#00C2A8]" />
              Cancele quando quiser. Sem fidelidade.
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Sair da conta
          </button>
        </motion.div>
      </div>
      {user && assinaturaOpen && <AssinaturaModal open={true} planoInicial={planoSelecionado} onClose={() => setAssinaturaOpen(false)} />}
    </>
  )
}
